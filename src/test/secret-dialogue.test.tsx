import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SecretDialogue from "@/components/secret-dialogue";
import MusicPromptDialog from "@/components/music-prompt-dialog";
import MobileGate, { detectMobileFromUA } from "@/components/mobile-gate";
import { VolleyballGame, ComplimentTerminal } from "@/components/playground";
import Experience from "@/components/experience";

describe("Secret Dialogue for Mirabel", () => {
  it("displays locked view with teaser and hint 'the name of the other guy'", async () => {
    const user = userEvent.setup();
    const playEffect = vi.fn();
    const toggleMusic = vi.fn();
    const toggleSound = vi.fn();

    render(
      <SecretDialogue
        isOpen={true}
        onClose={vi.fn()}
        audio={{
          musicOn: false,
          soundOn: true,
          toggleMusic,
          toggleSound,
          playEffect,
        }}
      />,
    );

    expect(screen.getByText("From: Nattz")).toBeTruthy();
    expect(screen.getByText(/Personal Access Only/)).toBeTruthy();
    expect(
      screen.getByText(/sweet payback for taking my earpiece and my two sweatshirts/),
    ).toBeTruthy();

    // Check hint is initially hidden
    expect(screen.queryByText(/the name of the other guy/i)).toBeNull();

    // Click "Need a clue?"
    const clueBtn = screen.getByRole("button", { name: /Need a clue\?/i });
    await user.click(clueBtn);

    expect(screen.getByText(/the name of the other guy/i)).toBeTruthy();
    expect(playEffect).toHaveBeenCalledWith("sparkle");
  });

  it("rejects incorrect passwords and provides playful error messages", async () => {
    const user = userEvent.setup();
    const playEffect = vi.fn();

    render(
      <SecretDialogue
        isOpen={true}
        onClose={vi.fn()}
        audio={{
          musicOn: false,
          soundOn: true,
          toggleMusic: vi.fn(),
          toggleSound: vi.fn(),
          playEffect,
        }}
      />,
    );

    const input = screen.getByLabelText(/Secret password/i);
    const unlockBtn = screen.getByRole("button", { name: /Unlock/i });

    await user.type(input, "wrongpassword");
    await user.click(unlockBtn);

    expect(playEffect).toHaveBeenCalledWith("error");
    expect(
      screen.getByText(/Nice try, Mirabel! You know me better than that\./i),
    ).toBeTruthy();
  });

  it("unlocks when entering 'praise' and displays the heartfelt decrypted letter", async () => {
    const user = userEvent.setup();
    const playEffect = vi.fn();
    const onTriggerConfetti = vi.fn();

    render(
      <SecretDialogue
        isOpen={true}
        onClose={vi.fn()}
        audio={{
          musicOn: false,
          soundOn: true,
          toggleMusic: vi.fn(),
          toggleSound: vi.fn(),
          playEffect,
        }}
        onTriggerConfetti={onTriggerConfetti}
      />,
    );

    const input = screen.getByLabelText(/Secret password/i);
    const unlockBtn = screen.getByRole("button", { name: /Unlock/i });

    // Case-insensitive test: 'Praise '
    await user.type(input, "Praise ");
    await user.click(unlockBtn);

    expect(playEffect).toHaveBeenCalledWith("success");
    expect(onTriggerConfetti).toHaveBeenCalled();

    // Verify unlocked content
    expect(screen.getByText("Straight From The Heart")).toBeTruthy();
    expect(
      screen.getByText(/I genuinely care about you\. Honestly, I love you\./i),
    ).toBeTruthy();
    expect(screen.getByText("Nattz")).toBeTruthy();
    expect(
      screen.getByText(/P\.S\. Yes, I still want my sweatshirts back\./i),
    ).toBeTruthy();

    // Test saving the letter as a screenshot
    const screenshotBtn = screen.getByRole("button", {
      name: /Save Letter Screenshot/i,
    });
    await user.click(screenshotBtn);
    expect(screen.getByText(/Screenshot Saved!/i)).toBeTruthy();
    expect(playEffect).toHaveBeenCalledWith("sparkle");
  });

  it("allows locking back up after unlocking", async () => {
    const user = userEvent.setup();
    const playEffect = vi.fn();

    render(
      <SecretDialogue
        isOpen={true}
        onClose={vi.fn()}
        audio={{
          musicOn: false,
          soundOn: true,
          toggleMusic: vi.fn(),
          toggleSound: vi.fn(),
          playEffect,
        }}
      />,
    );

    const input = screen.getByLabelText(/Secret password/i);
    await user.type(input, "praise");
    await user.click(screen.getByRole("button", { name: /Unlock/i }));

    expect(screen.getByText("Straight From The Heart")).toBeTruthy();

    const relockBtn = screen.getByRole("button", { name: /Lock Back Up/i });
    await user.click(relockBtn);

    expect(screen.queryByText("Straight From The Heart")).toBeNull();
    expect(screen.getByText(/Enter Secret Password to Decrypt/i)).toBeTruthy();
  });
});

describe("Music Prompt Dialog", () => {
  it("renders music prompt and fires onAccept when user wants music", async () => {
    const user = userEvent.setup();
    const onAccept = vi.fn();
    const onClose = vi.fn();

    render(
      <MusicPromptDialog
        isOpen={true}
        onClose={onClose}
        onAccept={onAccept}
        musicOn={false}
      />,
    );

    expect(screen.getByText("A Little Music for Mirabel?")).toBeTruthy();
    expect(
      screen.getByText(
        /Would you like to listen to the music while you explore\?/i,
      ),
    ).toBeTruthy();

    const acceptBtn = screen.getByRole("button", {
      name: /Yes, play the music/i,
    });
    await user.click(acceptBtn);

    expect(onAccept).toHaveBeenCalledTimes(1);
  });
});

describe("Experience initial pop-up", () => {
  it("pops up the secret dialogue box on page load when defaultSecretOpen is true", async () => {
    render(<Experience defaultSecretOpen={true} />);

    expect(screen.getByText("From: Nattz")).toBeTruthy();
    expect(screen.getByLabelText(/Secret password/i)).toBeTruthy();
  });
});

describe("Ball & Action Sound Effects", () => {
  it("plays ball_serve when starting the volleyball game and ball_bump on bumps", async () => {
    const user = userEvent.setup();
    const onSound = vi.fn();

    render(<VolleyballGame onSound={onSound} />);

    const court = screen.getByRole("button", {
      name: /Start the volleyball game/i,
    });
    await user.click(court);
    expect(onSound).toHaveBeenCalledWith("ball_serve");

    await new Promise((resolve) => window.setTimeout(resolve, 180));
    await user.click(court);
    expect(onSound).toHaveBeenCalledWith("ball_bump");
  });

  it("plays terminal sound when running another compliment", async () => {
    const user = userEvent.setup();
    const onSound = vi.fn();

    render(<ComplimentTerminal onSound={onSound} />);

    const btn = screen.getByRole("button", {
      name: /Run another compliment/i,
    });
    await user.click(btn);
    expect(onSound).toHaveBeenCalledWith("terminal");
  });

  it("allows shuffling gallery frames and swapping the hero polaroid", async () => {
    const user = userEvent.setup();
    render(<Experience />);

    // Swap hero polaroid frame
    expect(screen.getByText("the one & only, Mirabel.")).toBeTruthy();
    const swapBtn = screen.getByRole("button", {
      name: "Swap polaroid photograph",
    });
    await user.click(swapBtn);
    expect(screen.getByText("sunshine in every single frame.")).toBeTruthy();

    // Send a little love heart reaction
    const loveBtn = screen.getByRole("button", {
      name: "Send a little love to Mirabel",
    });
    await user.click(loveBtn);
    expect(within(loveBtn).getByText("1")).toBeTruthy();

    // Shuffle gallery frames
    const rail = screen.getByRole("region", { name: "Photographs of Mirabel" });
    const firstBefore = within(rail)
      .getAllByRole("button")[0]
      .getAttribute("aria-label");

    const shuffleBtn = screen.getByRole("button", { name: /Shuffle frames/i });
    await user.click(shuffleBtn);

    const firstAfter = within(rail)
      .getAllByRole("button")[0]
      .getAttribute("aria-label");
    expect(firstAfter).not.toBe(firstBefore);
    expect(screen.getByText("Featured pick")).toBeTruthy();
  });
});

describe("Mobile Blocker Gate (Infinix Hot 60i & Phone Detection)", () => {
  it("detects Infinix Hot 60i, other phones, and desktop user agents accurately", () => {
    expect(
      detectMobileFromUA(
        "Mozilla/5.0 (Linux; Android 14; Infinix X6728) AppleWebKit/537.36 Chrome/131.0.0.0 Mobile Safari/537.36",
      ),
    ).toEqual({
      isPhone: true,
      isInfinixHot60i: true,
    });

    expect(
      detectMobileFromUA(
        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/131.0.0.0 Mobile Safari/537.36",
        "Infinix HOT 60i",
        true,
      ),
    ).toEqual({
      isPhone: true,
      isInfinixHot60i: true,
    });

    expect(
      detectMobileFromUA(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
      ),
    ).toEqual({
      isPhone: true,
      isInfinixHot60i: false,
    });

    expect(
      detectMobileFromUA(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
      ),
    ).toEqual({
      isPhone: false,
      isInfinixHot60i: false,
    });
  });

  it("tells Mirabel 'No tricks' and to use her PC when on an Infinix Hot 60i", () => {
    render(
      <MobileGate
        forceDevice={{ isPhone: true, isInfinixHot60i: true }}
      />,
    );

    expect(screen.getByText(/INFINIX HOT 60i DETECTED/i)).toBeTruthy();
    expect(screen.getByText(/No tricks, Mirabel!/i)).toBeTruthy();
    expect(screen.getByText(/Go use your PC\./i)).toBeTruthy();
    expect(
      screen.queryByLabelText(/Mobile Access Password/i),
    ).toBeNull();
  });

  it("blocks other phones and unlocks mobile view with password 'redmi 12c'", async () => {
    const user = userEvent.setup();
    const onSound = vi.fn();
    sessionStorage.removeItem("mirabel-mobile-unlocked");

    render(
      <MobileGate
        onSound={onSound}
        forceDevice={{ isPhone: true, isInfinixHot60i: false }}
      />,
    );

    expect(screen.getByText(/Please use a PC/i)).toBeTruthy();
    const input = screen.getByLabelText(/Mobile Access Password/i);
    const unlockBtn = screen.getByRole("button", { name: /Unlock/i });

    // Check hint toggle
    expect(screen.queryByText(/the name of my old phone/i)).toBeNull();
    await user.click(screen.getByRole("button", { name: /Need a hint\?/i }));
    expect(screen.getByText(/the name of my old phone/i)).toBeTruthy();

    // Try wrong password
    await user.type(input, "wrongpass");
    await user.click(unlockBtn);
    expect(onSound).toHaveBeenCalledWith("error");
    expect(
      screen.getByText(/Wrong password! Please use a PC to view this site/i),
    ).toBeTruthy();

    // Enter 'redmi 12c'
    await user.type(input, "Redmi 12C");
    await user.click(unlockBtn);
    expect(onSound).toHaveBeenCalledWith("success");
    expect(screen.queryByText(/Please use a PC/i)).toBeNull();
  });
});


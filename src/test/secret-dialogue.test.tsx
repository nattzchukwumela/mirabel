import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SecretDialogue from "@/components/secret-dialogue";
import MusicPromptDialog from "@/components/music-prompt-dialog";
import MobileGate, { detectDevice, detectMobileFromUA } from "@/components/mobile-gate";
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
  it("detects Infinix Hot 60i, other phones, tablets, PC mode on phone, and desktop computers accurately", () => {
    // 1. Infinix
    expect(
      detectDevice(
        "Mozilla/5.0 (Linux; Android 14; Infinix X6728) AppleWebKit/537.36 Chrome/131.0.0.0 Mobile Safari/537.36",
      ).kind,
    ).toBe("infinix");

    // 2. Normal mobile phone
    expect(
      detectDevice(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
      ).kind,
    ).toBe("phone");

    // 3. Phone in PC mode / Desktop site (touchpoints + coarse pointer or mobile width with desktop UA)
    expect(
      detectDevice(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
        "",
        false,
        5,
        393,
        true,
      ).kind,
    ).toBe("phone_pc_mode");

    expect(
      detectDevice(
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
        "",
        false,
        5,
        412,
        true,
      ).kind,
    ).toBe("phone_pc_mode");

    // 4. Tablet
    expect(
      detectDevice(
        "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15",
      ).kind,
    ).toBe("tablet");

    // 5. Real desktop / computer
    expect(
      detectDevice(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
        "",
        false,
        0,
        1920,
        false,
      ).kind,
    ).toBe("desktop");
  });

  it("catches phone in PC mode and requires the 3-step stress quiz", () => {
    render(
      <MobileGate
        forceDevice={{ kind: "phone_pc_mode", label: "Phone in PC Mode" }}
        defaultOpen={true}
      />,
    );

    expect(screen.getByText(/PC MODE ON PHONE DETECTED/i)).toBeTruthy();
    expect(screen.getByText(/Nice try using PC mode! 😂/i)).toBeTruthy();
    expect(
      screen.getByText(/Did you really think turning on/i),
    ).toBeTruthy();
    expect(screen.getByPlaceholderText(/Enter phone model in lowercase/i)).toBeTruthy();
  });

  it("enables the gate and stress quiz on computer / desktop as well", () => {
    render(
      <MobileGate
        forceDevice={{ kind: "desktop", label: "Computer / PC" }}
        defaultOpen={true}
      />,
    );

    expect(screen.getByText(/COMPUTER DETECTED · VERIFICATION REQUIRED/i)).toBeTruthy();
    expect(screen.getByText(/Computer detected! 😂/i)).toBeTruthy();
    expect(
      screen.getByText(/You didn't think being on a computer meant you get a free pass, did you\?! 😂/i),
    ).toBeTruthy();
    expect(screen.getByPlaceholderText(/Enter phone model in lowercase/i)).toBeTruthy();
  });

  it("tells Mirabel 'No tricks' and still enforces the gate when on an Infinix Hot 60i", () => {
    render(
      <MobileGate
        forceDevice={{ kind: "infinix", label: "Infinix Hot 60i" }}
        defaultOpen={true}
      />,
    );

    expect(screen.getByText(/INFINIX HOT 60i DETECTED/i)).toBeTruthy();
    expect(screen.getByText(/No tricks, Mirabel!/i)).toBeTruthy();
    expect(screen.getByText(/Go use your PC\./i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/Enter phone model in lowercase/i)).toBeTruthy();
  });

  it("blocks other phones, displays the hilarious message, enforces lowercase, and requires passing the 3-step stress quiz (model, RAM/ROM, CPU)", async () => {
    const user = userEvent.setup();
    const onSound = vi.fn();
    const onUnlock = vi.fn();
    sessionStorage.clear();

    render(
      <MobileGate
        onSound={onSound}
        onUnlock={onUnlock}
        forceDevice={{ kind: "phone", label: "Mobile Phone" }}
        defaultOpen={true}
      />
    );

    // 1. Verify hilarious callout and privacy notice
    expect(
      screen.getByText(/Really, you are using a phone\?! 😂 I told you not to cheat jeez, use a PC!/i),
    ).toBeTruthy();
    expect(
      screen.getByText(/PRIVATE ACCESS ONLY • FOR MIRABEL/i),
    ).toBeTruthy();
    expect(
      screen.getByText(/This website is exclusively dedicated to Mirabel/i),
    ).toBeTruthy();

    // Step 1: Model check
    const step1Input = screen.getByPlaceholderText(/Enter phone model in lowercase/i);
    const nextBtn = screen.getByRole("button", { name: /Next/i });

    // Check hint toggle
    expect(screen.queryByText(/the name of my old phone/i)).toBeNull();
    await user.click(screen.getByRole("button", { name: /Need a hint\?/i }));
    expect(screen.getByText(/the name of my old phone/i)).toBeTruthy();

    // Try uppercase input -> MUST be blocked!
    await user.type(step1Input, "Redmi 12c");
    await user.click(nextBtn);
    expect(onSound).toHaveBeenCalledWith("error");
    expect(screen.getByText(/Uppercase letter detected! 😂 All passwords must be strictly in lowercase!/i)).toBeTruthy();

    // Clear and enter correct strictly lowercase 'redmi 12c'
    await user.clear(step1Input);
    await user.type(step1Input, "redmi 12c");
    await user.click(nextBtn);
    expect(onSound).toHaveBeenCalledWith("sparkle");
    expect(screen.getByText(/Wait, you actually got that\?! 😂/i)).toBeTruthy();

    // Step 2: RAM and ROM
    const ramInput = screen.getByLabelText(/RAM in GB \(numbers only\)/i);
    const romInput = screen.getByLabelText(/ROM in GB/i);
    const submitStep2Btn = screen.getByRole("button", { name: /Submit RAM & ROM/i });

    // RAM numbers-only enforcement
    await user.type(ramInput, "abc3xyz");
    expect((ramInput as HTMLInputElement).value).toBe("3");

    // Try uppercase ROM
    await user.type(romInput, "64GB");
    await user.click(submitStep2Btn);
    expect(onSound).toHaveBeenCalledWith("error");
    expect(screen.getByText(/Uppercase letter detected in ROM!/i)).toBeTruthy();

    // Clear ROM and enter lowercase 64gb
    await user.clear(romInput);
    await user.type(romInput, "64gb");
    await user.click(submitStep2Btn);
    expect(onSound).toHaveBeenCalledWith("sparkle");
    expect(screen.getByText(/Okay wow, you really know your phone specs 😂/i)).toBeTruthy();

    // Step 3: CPU Manufacturer
    const cpuInput = screen.getByPlaceholderText(/Enter CPU manufacturer in lowercase/i);
    const unlockBtn = screen.getByRole("button", { name: /Unlock 😂/i });

    // Try uppercase CPU
    await user.type(cpuInput, "MediaTek");
    await user.click(unlockBtn);
    expect(onSound).toHaveBeenCalledWith("error");
    expect(screen.getByText(/Uppercase detected! 😂 Strictly lowercase only!/i)).toBeTruthy();

    // Enter correct lowercase mediatek
    await user.clear(cpuInput);
    await user.type(cpuInput, "mediatek");
    await user.click(unlockBtn);
    expect(onSound).toHaveBeenCalledWith("success");
    expect(screen.getByText(/Fine, you win!! 😂 You really stressed yourself/i)).toBeTruthy();
    await waitFor(() => expect(onUnlock).toHaveBeenCalledTimes(1), { timeout: 2000 });
  });
});


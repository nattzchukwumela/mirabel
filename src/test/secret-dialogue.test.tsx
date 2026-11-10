import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SecretDialogue from "@/components/secret-dialogue";
import MusicPromptDialog from "@/components/music-prompt-dialog";
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


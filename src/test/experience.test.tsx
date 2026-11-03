import { describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Experience from "@/components/experience";
import { letter } from "@/lib/personalization";

describe("The Mirabel Experience", () => {
  it("opens the letter and makes every supplied paragraph available", async () => {
    const user = userEvent.setup();
    render(<Experience />);

    expect(
      screen.queryByRole("article", { name: "A personal letter to Mirabel" }),
    ).toBeNull();
    await user.click(
      screen.getByRole("button", { name: "Open your appreciation letter" }),
    );
    const article = screen.getByRole("article", {
      name: "A personal letter to Mirabel",
    });
    const reveal = within(article).getByRole("button", {
      name: /Read it all|All here, just for you/,
    });
    await user.click(reveal);

    for (const paragraph of letter) {
      expect(
        within(article).getByText(paragraph, { exact: true }).textContent,
      ).toBe(paragraph);
    }
    expect(
      within(article)
        .getByRole("button", { name: /All here, just for you/ })
        .getAttribute("aria-disabled"),
    ).toBe("true");
    expect(
      within(article).queryByLabelText("The letter is unfolding"),
    ).toBeNull();
  });

  it("refuses to reduce appreciation, then increases it with the matching feedback", async () => {
    const user = userEvent.setup();
    render(<Experience />);
    const section = screen.getByRole("region", {
      name: /The appreciation\s*is off the charts/,
    });
    expect(section.querySelector("strong")?.textContent).toBe("100%");

    await user.click(
      within(section).getByRole("button", {
        name: "Try to decrease appreciation",
      }),
    );
    expect(
      within(section).getByText(
        /ERROR 404: Reasons not to appreciate Mirabel could not be found\./,
      ),
    ).toBeTruthy();
    expect(section.querySelector("strong")?.textContent).toBe("100%");

    await user.click(
      within(section).getByRole("button", { name: "Increase appreciation" }),
    );
    expect(section.querySelector("strong")?.textContent).toBe("125%");
    expect(
      within(section).getByText(
        "WARNING: Appreciation levels exceeding safe limits!",
      ),
    ).toBeTruthy();
    await user.click(
      within(section).getByRole("button", {
        name: "Try to decrease appreciation",
      }),
    );
    expect(section.querySelector("strong")?.textContent).toBe("125%");
  });

  it("switches interests and lets Mirabel pick books or run a new compliment", async () => {
    const user = userEvent.setup();
    render(<Experience />);
    const booksTab = screen.getByRole("tab", { name: /Books/ });
    await user.click(booksTab);
    expect(booksTab.getAttribute("aria-selected")).toBe("true");
    const book = screen.getByRole("button", {
      name: "Explore Lights Out by Navessa Allen",
    });
    await user.click(book);
    expect(book.getAttribute("aria-pressed")).toBe("true");
    expect(
      screen.getByText("Lights Out · Navessa Allen · Into Darkness series"),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: "Explore Caught Up by Navessa Allen",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Explore Game On by Navessa Allen" }),
    ).toBeTruthy();

    await user.click(screen.getByRole("tab", { name: /Technology/ }));
    const rerun = screen.getByRole("button", {
      name: /Run another compliment/,
    });
    await user.click(rerun);
    expect(
      screen.getAllByText("Your kindness is your superpower. No cape needed.")
        .length,
    ).toBeGreaterThan(0);

    await user.click(screen.getByRole("tab", { name: /Faith/ }));
    expect(
      screen.getByText(
        "A girl who loves God, serves with her heart, and finds joy in helping others.",
      ),
    ).toBeTruthy();
  });

  it("reveals the real-world surprise while keeping the actual gift secret", async () => {
    const user = userEvent.setup();
    render(<Experience />);
    const section = screen.getByRole("region", {
      name: /And because\s*you deserve beautiful things/,
    });
    const message =
      "Somewhere outside this website, there's a little something waiting for you. Because you deserve to be appreciated in the real world too.";
    expect(within(section).queryByText(message)).toBeNull();
    await user.click(
      within(section).getByRole("button", { name: /Open My Surprise/ }),
    );
    expect(within(section).getByText(message)).toBeTruthy();
    expect(
      within(section).queryByRole("button", { name: /Open My Surprise/ }),
    ).toBeNull();
  });

  it("toggles daylight and nighttime and remembers the preference", async () => {
    const user = userEvent.setup();
    render(<Experience />);
    await user.click(
      screen.getByRole("button", { name: "Switch to magical nighttime" }),
    );
    expect(document.documentElement.dataset.theme).toBe("night");
    expect(localStorage.getItem("mirabel-theme")).toBe("night");
    await user.click(
      screen.getByRole("button", { name: "Switch to soft daylight" }),
    );
    expect(document.documentElement.dataset.theme).toBe("day");
    expect(localStorage.getItem("mirabel-theme")).toBe("day");
  });

  it("uncovers her hidden ability and can fold the note away again", async () => {
    const user = userEvent.setup();
    render(<Experience />);
    await user.click(
      screen.getByRole("button", { name: /Tap to uncover her hidden ability/ }),
    );
    const ability = screen.getByRole("button", {
      name: /Making even difficult people feel appreciated/,
    });
    expect(ability.getAttribute("aria-expanded")).toBe("true");
    await user.click(ability);
    expect(
      screen
        .getByRole("button", { name: /Tap to uncover her hidden ability/ })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("opens gallery photos, changes the photo, and restores focus and scrolling on close", async () => {
    const user = userEvent.setup();
    render(<Experience />);
    document.body.style.overflow = "auto";
    const trigger = screen.getByRole("button", {
      name: /Enlarge photograph 1:/,
    });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", {
      name: "Quite simply, Mirabel.",
    });
    expect((dialog as HTMLDialogElement).open).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");
    expect(within(dialog).getByText("1 / 9")).toBeTruthy();
    await user.click(
      within(dialog).getByRole("button", { name: "Next photograph" }),
    );
    expect(
      within(dialog).getByText("A little sunshine, personified."),
    ).toBeTruthy();
    expect(within(dialog).getByText("2 / 9")).toBeTruthy();
    await user.click(
      within(dialog).getByRole("button", { name: "Close photograph" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.body.style.overflow).toBe("auto");
    expect(document.activeElement).toBe(trigger);
  });

  it("opens the secret lullaby and closes it without leaving the page scroll-locked", async () => {
    const user = userEvent.setup();
    render(<Experience />);
    await user.click(
      screen.getByRole("button", { name: "Discover the secret lullaby" }),
    );
    const dialog = screen.getByRole("dialog", { name: /The Lullaby/ });
    expect((dialog as HTMLDialogElement).open).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");
    expect(
      within(dialog).getByText(/A little space saved for an original lullaby/),
    ).toBeTruthy();
    await user.click(
      within(dialog).getByRole("button", { name: "Close the lullaby" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.body.style.overflow).toBe("");
  });

  it("moves keyboard focus into sound controls and restores the floating trigger on Escape", async () => {
    const user = userEvent.setup();
    render(<Experience />);
    const trigger = screen.getByRole("button", {
      name: "Open music and volume controls",
    });
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Play a little music" }),
    );
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    await user.keyboard("{Escape}");
    expect(
      screen.queryByRole("button", { name: "Play a little music" }),
    ).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  it("starts a keyboard rally and counts a successful bump", async () => {
    const user = userEvent.setup();
    render(<Experience />);
    const court = screen.getByRole("button", {
      name: "Start the volleyball game",
    });
    court.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: /Bump the volleyball/ })).toBe(
      court,
    );
    await new Promise((resolve) => window.setTimeout(resolve, 200));
    await user.keyboard(" ");
    expect(screen.getByText("1 bump", { exact: true })).toBeTruthy();
  });
});

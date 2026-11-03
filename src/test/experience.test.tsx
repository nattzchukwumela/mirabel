import { describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Experience from "@/components/experience";
import VideoKeepsake from "@/components/video-keepsake";
import { letter } from "@/lib/personalization";
import photos from "../../public/images/manifest.json";

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
      name: photos[0].caption,
    });
    expect((dialog as HTMLDialogElement).open).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");
    expect(within(dialog).getByText(`1 / ${photos.length}`)).toBeTruthy();
    await user.click(
      within(dialog).getByRole("button", { name: "Previous photograph" }),
    );
    expect(
      within(dialog).getByText(`${photos.length} / ${photos.length}`),
    ).toBeTruthy();
    expect(
      within(dialog).getByRole("img", { name: photos.at(-1)!.alt }),
    ).toBeTruthy();
    await user.click(
      within(dialog).getByRole("button", { name: "Next photograph" }),
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Next photograph" }),
    );
    expect(within(dialog).getByText(photos[1].caption)).toBeTruthy();
    expect(within(dialog).getByText(`2 / ${photos.length}`)).toBeTruthy();
    await user.click(
      within(dialog).getByRole("button", { name: "Close photograph" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.body.style.overflow).toBe("auto");
    expect(document.activeElement).toBe(trigger);
  });

  it("puts the newest photo first and loads it immediately in the rail and viewer", async () => {
    const user = userEvent.setup();
    render(<Experience />);
    const rail = screen.getByRole("region", { name: "Photographs of Mirabel" });
    const firstPhoto = within(rail).getAllByRole("button")[0];
    const thumbnail = within(firstPhoto).getByRole("img") as HTMLImageElement;
    expect(thumbnail.getAttribute("src")).toBe("/images/miri-yet.jpeg");
    expect(thumbnail.getAttribute("loading")).toBe("eager");
    expect(within(firstPhoto).getByText("Newest photo")).toBeTruthy();
    await user.click(firstPhoto);
    const dialog = screen.getByRole("dialog", { name: photos[0].caption });
    const image = within(dialog).getByRole("img") as HTMLImageElement;
    expect(image.getAttribute("src")).toBe("/images/miri-yet.jpeg");
    expect(image.getAttribute("loading")).toBe("eager");
    expect(within(dialog).getByText(`1 / ${photos.length}`)).toBeTruthy();
  });

  it("opens every photo through View all and returns focus to that control", async () => {
    const user = userEvent.setup();
    render(<Experience />);
    const trigger = screen.getByRole("button", {
      name: `View all ${photos.length} photos`,
    });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: photos[0].caption });
    expect(within(dialog).getByText(`1 / ${photos.length}`)).toBeTruthy();
    await user.click(
      within(dialog).getByRole("button", { name: "Previous photograph" }),
    );
    expect(within(dialog).getByText(photos.at(-1)!.caption)).toBeTruthy();
    expect(
      within(dialog).getByText(`${photos.length} / ${photos.length}`),
    ).toBeTruthy();
    await user.click(
      within(dialog).getByRole("button", { name: "Close photograph" }),
    );
    expect(document.activeElement).toBe(trigger);
  });

  it("offers a retry and the original file when a gallery image fails to load", async () => {
    const user = userEvent.setup();
    render(<Experience />);
    await user.click(
      screen.getByRole("button", { name: `View all ${photos.length} photos` }),
    );
    const dialog = screen.getByRole("dialog", { name: photos[0].caption });
    fireEvent.error(within(dialog).getByRole("img"));
    const alert = within(dialog).getByRole("alert");
    expect(
      within(alert)
        .getByRole("link", { name: /Open photo/ })
        .getAttribute("href"),
    ).toContain(photos[0].src);
    await user.click(within(alert).getByRole("button", { name: /Try again/ }));
    expect(within(dialog).queryByRole("alert")).toBeNull();
    const retryImage = within(dialog).getByRole("img");
    fireEvent.load(retryImage);
    expect(within(dialog).queryByRole("alert")).toBeNull();
  });

  it("follows the measured mobile photo spacing and reaches the final image", async () => {
    const user = userEvent.setup();
    render(<Experience />);
    const rail = screen.getByRole("region", { name: "Photographs of Mirabel" });
    const items = within(rail).getAllByRole("button");
    // A narrow viewport with 180px photos, the mobile 21px gap, and 26px
    // side padding. jsdom needs explicit measurements because it has no layout.
    const photoWidth = 180;
    const gap = 21;
    const padding = 26;
    const viewportWidth = 300;
    const contentWidth =
      items.length * photoWidth + (items.length - 1) * gap + padding * 2;
    const maximumScroll = contentWidth - viewportWidth;
    rail.style.paddingLeft = `${padding}px`;
    Object.defineProperties(rail, {
      clientWidth: { configurable: true, value: viewportWidth },
      scrollWidth: { configurable: true, value: contentWidth },
    });
    items.forEach((item, index) => {
      Object.defineProperties(item, {
        offsetLeft: {
          configurable: true,
          value: padding + index * (photoWidth + gap),
        },
        offsetWidth: { configurable: true, value: photoWidth },
      });
    });
    const scroll = vi.spyOn(rail, "scrollTo");
    fireEvent.scroll(rail);
    const next = screen.getByRole("button", {
      name: "Next photographs",
    }) as HTMLButtonElement;
    await user.click(next);
    expect(scroll).toHaveBeenLastCalledWith({
      left: photoWidth + gap,
      behavior: "auto",
    });

    rail.scrollLeft = (items.length - 2) * (photoWidth + gap);
    fireEvent.scroll(rail);
    await user.click(next);
    expect(scroll).toHaveBeenLastCalledWith({
      left: maximumScroll,
      behavior: "auto",
    });
    rail.scrollLeft = maximumScroll;
    fireEvent.scroll(rail);
    expect(next.disabled).toBe(true);
    expect(
      screen.getByText(
        `Showing ${items.length - 1}–${items.length} of ${items.length} photos`,
      ),
    ).toBeTruthy();
    await user.click(
      screen.getByRole("button", { name: "Previous photographs" }),
    );
    expect(scroll).toHaveBeenLastCalledWith({
      left: (items.length - 2) * (photoWidth + gap),
      behavior: "auto",
    });
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

describe("Mirabel's video keepsake", () => {
  it("offers native playback controls without autoplay and follows global mute and volume", () => {
    const onPlay = vi.fn();
    const { rerender } = render(
      <VideoKeepsake soundOn volume={0.35} onPlay={onPlay} />,
    );
    const video = screen.getByLabelText(
      "Play a 15-second video montage of Mirabel",
    ) as HTMLVideoElement;
    expect(video.controls).toBe(true);
    expect(video.playsInline).toBe(true);
    expect(video.preload).toBe("metadata");
    expect(video.getAttribute("poster")).toBe("/videos/miri-poster.jpg");
    expect(video.querySelector("source")?.getAttribute("src")).toBe(
      "/videos/miri.mp4",
    );
    expect(video.hasAttribute("autoplay")).toBe(false);
    expect(video.muted).toBe(false);
    expect(video.volume).toBe(0.35);
    fireEvent.play(video);
    expect(onPlay).toHaveBeenCalledTimes(1);
    rerender(<VideoKeepsake soundOn={false} volume={0.7} onPlay={onPlay} />);
    expect(video.muted).toBe(true);
    expect(video.volume).toBe(0.7);
  });

  it("provides a direct clip and a working retry control after a media error", async () => {
    const user = userEvent.setup();
    render(<VideoKeepsake />);
    const video = screen.getByLabelText(
      "Play a 15-second video montage of Mirabel",
    ) as HTMLVideoElement;
    fireEvent.error(video);
    const alert = screen.getByRole("alert");
    expect(
      within(alert)
        .getByRole("link", { name: /Open the clip directly/ })
        .getAttribute("href"),
    ).toBe("/videos/miri.mp4");
    expect(video.controls).toBe(false);
    await user.click(
      within(alert).getByRole("button", {
        name: "Try loading the video again",
      }),
    );
    expect(screen.queryByRole("alert")).toBeNull();
    expect(video.load).toHaveBeenCalledTimes(1);
    expect(video.controls).toBe(true);
  });
});

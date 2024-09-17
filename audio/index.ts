import { Howl } from "howler";

export class AudioManager {
  audioMap = new Map<string, Howl>();
  constructor(sources: { [key: string]: { src: string; rate: number } }) {
    this.init(sources);
  }
  init(sources: { [key: string]: { src: string; rate: number } }) {
    Object.keys(sources).forEach((key) => {
      const loop = key !== "spawn";
      this.audioMap.set(
        key,
        new Howl({
          src: [sources[key].src],
          autoplay: false,
          rate: sources[key].rate,
          loop: false,
          volume: 0.5,
        })
      );
    });
  }

  play(event: string) {
    const audio = this.audioMap.get(event);
    if (!audio?.playing()) {
      console.log("playing ", event);
      audio?.play();
    }
  }
  pause(event: string) {
    const audio = this.audioMap.get(event);
    if (audio?.playing()) {
      console.log("pause ", event);
      audio.stop();
    }
  }
  setVolumn(vol: number, event?: string) {
    if (event) {
      const audio = this.audioMap.get(event);
      audio?.volume(vol);
      return;
    } else {
      Howler.volume(vol);
    }
  }
  mute(muted: boolean, event?: string) {
    if (event) {
      const audio = this.audioMap.get(event);
      audio?.mute(muted);
    } else {
      Howler.mute(muted);
    }
  }
  fade(
    event: string,
    from: number,
    to: number,
    duration: number,
    group?: number
  ) {
    if (event) {
      const audio = this.audioMap.get(event);
      audio?.fade(from, to, duration, group);
    }
  }
}

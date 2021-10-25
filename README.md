# Phrasa
Phrasa is a music making language.

It is based upon the understanding that music can be broken down to sections within sections, and that these sections often repeat themselves in some form.

Phrasa is the tool for writing down music within a musical structure. It supports the musician throughout his / hers creation process by allowing him / her to **R e u s e** musical elements.

Instead of writing down a rigid sequence of notes and audio, you create a flexible structure of sections and musical events.

Here is an example:

```Phrasa
tempo 130bpm
pitch.zone g2
sections.#.pitch.grid
  1 (chord g-maj)
  2 (chord d-maj)
sections.1-2
  branches.rhythm
    instrument drums
    sections.1-4
      beat
      event.sample kick
  sequences.cool_sequence 0,5,4,3,6
  branches.melody
    instrument brassy
    sections.total 16
    sections.1,4,7,9,13.event
      pitch (sequences.cool_sequence >)
      end 200%
```

You can find more details on the language in this [documentation](https://progressive-instruments.github.io/phrasa-docs/)

### Phrasa Control

Phrasa Control is the user interface for writing Phrasa language and controlling Phrasa Player.

You can get it for free [here](https://www.progressive-instruments.com/phrasa)

### Source

The source is made of two entirely separated parts:

* Interpreter - The Phrasa language interpreter, written in Typescript. It is basically an NPM package with a single interface receiving text and making it into sequence of notes
* Player - This is the code for the executable that receives sequence of notes and plays it out. It is written in C++ and dependent upon JUCE framework and Surge Synth.


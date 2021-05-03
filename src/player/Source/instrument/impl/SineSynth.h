#pragma once

#include <mutex>
#include "juce_audio_basics/juce_audio_basics.h"

#include "IInstrument.h"
#include "SequenceProcessor.h"

namespace phrasa::instrument::impl {

struct SineWaveSound : public juce::SynthesiserSound
{
    SineWaveSound() {}

    bool appliesToNote(int /*midiNoteNumber*/) override { return true; }
    bool appliesToChannel(int /*midiChannel*/) override { return true; }
};

struct SineWaveVoice : public juce::SynthesiserVoice
{
    SineWaveVoice() {}

    bool canPlaySound(juce::SynthesiserSound* sound) override
    {
        return dynamic_cast<SineWaveSound*> (sound) != nullptr;
    }

    void startNote(int midiNoteNumber, float velocity,
        juce::SynthesiserSound*, int /*currentPitchWheelPosition*/) override
    {
        currentAngle = 0.0;
        level = velocity * 0.15;
        tailOff = 0.0;

        auto cyclesPerSecond = juce::MidiMessage::getMidiNoteInHertz(midiNoteNumber);
        auto cyclesPerSample = cyclesPerSecond / getSampleRate();

        angleDelta = cyclesPerSample * juce::MathConstants<double>::twoPi;
    }

    void stopNote(float /*velocity*/, bool allowTailOff) override
    {
        if (allowTailOff)
        {

            if (tailOff == 0.0)
                tailOff = 1.0;
        }
        else
        {
            clearCurrentNote();
            angleDelta = 0.0;
        }
    }

    void pitchWheelMoved(int /*newValue*/) override {}
    void controllerMoved(int /*controllerNumber*/, int /*newValue*/) override {}

    void renderNextBlock(juce::AudioBuffer<float>& outputBuffer, int startSample, int numSamples) override
    {
        if (angleDelta != 0.0)
        {
            if (tailOff > 0.0)
            {
                while (--numSamples >= 0)
                {
                    auto currentSample = (float)(std::sin(currentAngle) * level * tailOff);

                    for (auto i = outputBuffer.getNumChannels(); --i >= 0;)
                        outputBuffer.addSample(i, startSample, currentSample);

                    currentAngle += angleDelta;
                    ++startSample;

                    tailOff *= 0.99;

                    if (tailOff <= 0.005)
                    {
                        clearCurrentNote();

                        angleDelta = 0.0;
                        break;
                    }
                }
            }
            else
            {
                while (--numSamples >= 0)
                {
                    auto currentSample = (float)(std::sin(currentAngle) * level);

                    for (auto i = outputBuffer.getNumChannels(); --i >= 0;)
                        outputBuffer.addSample(i, startSample, currentSample);

                    currentAngle += angleDelta;
                    ++startSample;
                }
            }
        }
    }

    using SynthesiserVoice::renderNextBlock;

private:
    double currentAngle = 0.0, angleDelta = 0.0, level = 0.0, tailOff = 0.0;
};


struct SineSynth : public phrasa::instrument::IInstrument
{

    SineSynth()
    {
        for (auto i = 0; i < 4; ++i)
        {
            synth.addVoice(new SineWaveVoice());
        }

        setUsingSineWaveSound();
    }


    void setUsingSineWaveSound()
    {
        synth.clearSounds();
        synth.addSound(new SineWaveSound());
    }


    void prepareForProcessing(double sampleRate, size_t expectedBlockSize) override
    {
        synth.setCurrentPlaybackSampleRate(sampleRate);
        m_sampleTimeMs = 1.0 / sampleRate / 1000;
    }

    virtual void setSequence(std::unique_ptr<phrasa::Sequence>& sequence)
    {
        m_sequenceProcessor.setSequence(sequence);
    }


    void processingEnded() override {
    }
    
    int getMidiNote(double freq) {
        return std::round(log(freq / 440.0) / log(2) * 12 + 69);
    }

    void processBlock(phrasa::audio::AudioBuffer& buffer, const SequenceTrack& track/*, real time events*/) override
    {
        juce::AudioBuffer juceBuff(buffer.data, buffer.numChannels, buffer.numSamples);
        juceBuff.clear();

        juce::MidiBuffer incomingMidi;
        m_sequenceProcessor.setSequenceTrack(track);
        
        while (true) {
            auto event = m_sequenceProcessor.getNextEvent();
            if (!event.has_value()) {
                break;
            }
                
            int sample = event->relativeTime.getMilliSeconds() / m_sampleTimeMs;
            if (event->event->values.count("frequency")) {
                auto midi = getMidiNote(event->event->values["frequency"]->getValue());
                if (midi >= 0) {
                    incomingMidi.addEvent(juce::MidiMessage::noteOn(1, midi, (juce::uint8)127), sample);
                    m_eventPool.addEvent(event->event, event->relativeTime);
                }
            }
            
        }
        m_eventPool.advance(track.Duration);
        while (true) {
            auto event = m_eventPool.getNextEvent();
            if (!event.has_value()) {
                break;
            }
            if (event->event->values.count("frequency")) {
                int sample = event->relativeTime.getMilliSeconds() / m_sampleTimeMs;
                auto midi = getMidiNote(event->event->values["frequency"]->getValue());
                incomingMidi.addEvent(juce::MidiMessage::noteOff(1, midi), sample);
            }

        }
        synth.renderNextBlock(juceBuff, incomingMidi, 0, buffer.numSamples);
    }

    double m_sampleTimeMs;
    juce::Synthesiser synth;
    SequenceProcessor m_sequenceProcessor;
    EventHolder m_eventPool;
};


}
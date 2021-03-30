
#include <mutex>
#include "juce_audio_basics/juce_audio_basics.h"
#pragma once



struct SineWaveSound : public juce::SynthesiserSound
{
    SineWaveSound() {}

    bool appliesToNote (int /*midiNoteNumber*/) override    { return true; }
    bool appliesToChannel (int /*midiChannel*/) override    { return true; }
};

struct SineWaveVoice  : public juce::SynthesiserVoice
{
    SineWaveVoice() {}

    bool canPlaySound (juce::SynthesiserSound* sound) override
    {
        return dynamic_cast<SineWaveSound*> (sound) != nullptr;
    }

    void startNote (int midiNoteNumber, float velocity,
                    juce::SynthesiserSound*, int /*currentPitchWheelPosition*/) override
    {
        currentAngle = 0.0;
        level = velocity * 0.15;
        tailOff = 0.0;

        auto cyclesPerSecond = juce::MidiMessage::getMidiNoteInHertz (midiNoteNumber);
        auto cyclesPerSample = cyclesPerSecond / getSampleRate();

        angleDelta = cyclesPerSample * juce::MathConstants<double>::twoPi;
    }

    void stopNote (float /*velocity*/, bool allowTailOff) override
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

    void pitchWheelMoved (int /*newValue*/) override                              {}
    void controllerMoved (int /*controllerNumber*/, int /*newValue*/) override    {}

    void renderNextBlock (juce::AudioBuffer<float>& outputBuffer, int startSample, int numSamples) override
    {
        if (angleDelta != 0.0)
        {
            if (tailOff > 0.0)
            {
                while (--numSamples >= 0)
                {
                    auto currentSample = (float) (std::sin (currentAngle) * level * tailOff);

                    for (auto i = outputBuffer.getNumChannels(); --i >= 0;)
                        outputBuffer.addSample (i, startSample, currentSample);

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
                    auto currentSample = (float) (std::sin (currentAngle) * level);

                    for (auto i = outputBuffer.getNumChannels(); --i >= 0;)
                        outputBuffer.addSample (i, startSample, currentSample);

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

struct SineSynth  : public juce::AudioSource
{

    SineSynth ()
    {
        m_lastIndex = -1;
        m_lastNote = -1;
        m_currentTime = 0;
        for (auto i = 0; i < 4; ++i)
        {
            synth.addVoice (new SineWaveVoice());
        }

        setUsingSineWaveSound();
    }

    void setSequence(const std::vector<int>& notes)
    {
        std::lock_guard<std::mutex> guard(m_sequenceMutex);
        m_sequence = notes;
    }

    void setUsingSineWaveSound()
    {
        synth.clearSounds();
        synth.addSound (new SineWaveSound());
    }

    void prepareToPlay (int /*samplesPerBlockExpected*/, double sampleRate) override
    {
        synth.setCurrentPlaybackSampleRate (sampleRate);
        m_sampleTime = 1 / sampleRate;
    }

    void releaseResources() override {}

    void getNextAudioBlock (const juce::AudioSourceChannelInfo& bufferToFill) override
    {
        bufferToFill.clearActiveBufferRegion();

        juce::MidiBuffer incomingMidi;
        if (!m_sequenceMutex.try_lock()) {
            return;
        }
        try {
            m_lastIndex = std::min((int)m_sequence.size()-1, m_lastIndex);
            for (int sample = 0; sample < bufferToFill.numSamples; ++sample)
            {

                double eachNoteDuration = sequenceTime / (double)m_sequence.size();
                int currentIndex = (int)(m_currentTime / eachNoteDuration);
                if (currentIndex != m_lastIndex)
                {
                    if (m_lastNote > -1)
                    {
                        incomingMidi.addEvent(juce::MidiMessage::noteOff(1, m_lastNote), sample);
                    }
                    incomingMidi.addEvent(juce::MidiMessage::noteOn(1, m_sequence[currentIndex], (uint8_t)127), sample);
                    m_lastNote = m_sequence[currentIndex];
                    m_lastIndex = currentIndex;
                }


                m_currentTime += m_sampleTime;
                if (m_currentTime >= sequenceTime)
                {
                    m_currentTime = m_currentTime - sequenceTime;
                }
            }

            synth.renderNextBlock(*bufferToFill.buffer, incomingMidi, 0, bufferToFill.numSamples);
        }
        catch(std::exception) {
            m_sequenceMutex.unlock();
            throw;
        }
        m_sequenceMutex.unlock();
    }

    juce::Synthesiser synth;
    std::vector<int> m_sequence = std::vector<int> {60,62,64};
    const double sequenceTime = 2.0;
    double m_currentTime;
    double m_sampleTime;
    int m_lastIndex;
    std::mutex m_sequenceMutex;
    int m_lastNote;
};


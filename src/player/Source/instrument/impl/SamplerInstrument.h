#pragma once

#include <mutex>
#include "juce_audio_basics/juce_audio_basics.h"
#include "juce_audio_formats/juce_audio_formats.h"

#include "IInstrument.h"
#include "SequenceProcessor.h"

namespace phrasa::instrument::impl {

struct SampleSettings {

    SampleSettings(const std::string& _name, const std::string& _path) 
    :   name(_name),
        path(_path)
    {}

    std::string name;
    std::string path;
};

class SamplerInstrument : public IInstrument
{
public:
    const int VOICES = 4;
    SamplerInstrument(const std::vector<SampleSettings>& samples)
    {
        if (samples.size() > 128) {
            throw new std::out_of_range("max 128 samples are allowed");
        }

        for (auto i = 0; i < VOICES; ++i)
        {
            m_synth.addVoice(new juce::SamplerVoice());    // and these ones play the sampled sounds
        }

        juce::WavAudioFormat wavFormat;
        for (int i = 0; i < samples.size(); ++i) {
            juce::File file(samples[i].path);
            auto inputStrem = file.createInputStream();
            std::unique_ptr<juce::AudioFormatReader> audioReader(wavFormat.createReaderFor(inputStrem.release(),true));
            juce::BigInteger note;
            note.setBit(i);
            m_synth.addSound(new juce::SamplerSound(
                samples[i].name,
                *audioReader,
                note,
                i,
                0.1,
                0.1,
                10.0));
            m_nameToNote[samples[i].name] = i;
        }
    }

    void prepareForProcessing(double sampleRate, size_t expectedBlockSize) override
    {
        m_synth.setCurrentPlaybackSampleRate(sampleRate);
        m_sampleTimeMs = 1.0 / sampleRate * 1000;
    }

    void processingEnded() override {}


    void processBlock(audio::AudioBuffer& buffer, const SequenceTrack& track/*, real time events*/) override {

        juce::AudioBuffer juceBuff(buffer.getWriteData(), buffer.getNumChannels(), buffer.getNumSamples());
        juceBuff.clear();

        juce::MidiBuffer incomingMidi;
        m_sequenceProcessor.consume(track, [this, &incomingMidi, &buffer](auto event) {
            auto& values = event.event->values;

            if (values.count("sample") && std::holds_alternative<std::string>(values["sample"])) {
                auto sampleName = std::get<std::string>(values["sample"]);
                if (m_nameToNote.count(sampleName)) {
                    int sample = event.relativeTime.getMilliSeconds() / m_sampleTimeMs;
                    addToMidiBuffer(incomingMidi, juce::MidiMessage::noteOn(1, m_nameToNote[sampleName], (juce::uint8)127), sample, (int)buffer.getNumSamples());
                    m_eventPool.addEvent(event.event, event.relativeTime + event.event->duration);
                }
            }
            });



        m_eventPool.consume(track.Duration, [this, &incomingMidi, &buffer](auto event) {
            auto& values = event.event->values;

            if (values.count("sample") && std::holds_alternative<std::string>(values["sample"])) {
                auto sampleName = std::get<std::string>(values["sample"]);
                if (m_nameToNote.count(sampleName)) {
                    int sample = event.relativeTime.getMilliSeconds() / m_sampleTimeMs;
                    addToMidiBuffer(incomingMidi, juce::MidiMessage::noteOff(1, m_nameToNote[sampleName], (juce::uint8)127), sample, (int)buffer.getNumSamples());
                }
            }
            });

        m_synth.renderNextBlock(juceBuff, incomingMidi, 0, buffer.getNumSamples());
    }

    void setSequence(std::unique_ptr<Sequence<std::shared_ptr<Event>>>& sequence) override {
        m_sequenceProcessor.setSequence(sequence);
    }

    /**
     * @brief Clear sequence if exists
     * @param
    */
    void clearSequence() override {
        m_sequenceProcessor.clearSequence();
    }

private:
    // should be optimized - should find better solution ro midi buffer...
    void addToMidiBuffer(juce::MidiBuffer& buffer, const juce::MidiMessage& msg, int sample, int totalSamples) {
        int incrementor = 0;
        auto pos = buffer.findNextSamplePosition(sample);
        while(pos != buffer.end() && (*pos).samplePosition == (sample + incrementor)) {
            --incrementor;
            pos = buffer.findNextSamplePosition(sample + incrementor);
        }
        if (sample + incrementor < 0) {
            incrementor = 1;
            while (pos != buffer.end() && (*pos).samplePosition == (sample + incrementor)) {
                ++incrementor;
                pos = buffer.findNextSamplePosition(sample + incrementor);
            }
            if (incrementor + sample > totalSamples) {
                // message not added to buffer
                return;
            }
        }
        buffer.addEvent(msg, sample + incrementor);


    }


    SequenceProcessor<std::shared_ptr<Event>> m_sequenceProcessor;
    EventHolder<std::shared_ptr<Event>> m_eventPool;
    std::map<std::string, int> m_nameToNote;
    juce::Synthesiser m_synth;
    double m_sampleTimeMs;
};

}
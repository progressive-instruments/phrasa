#pragma once

#include "IInstrument.h"
#include "SurgeSynthesizer.h"
#include "SequenceProcessor.h"

namespace phrasa::instrument::impl {

class SurgeInstrument : public IInstrument, public SurgeSynthesizer::PluginLayer {
public:
	SurgeInstrument(int preset) :
        m_blockPos(0),
        m_surge(new SurgeSynthesizer(this, "C:\\Users\\erez\\Desktop\\dev\\phrasa\\src\\player\\Source\\instrument\\impl\\surge\\resources\\data"))
    {
        m_surge->storage.initializePatchDb(); 
        m_surge->programChange(1, preset);
    }
	void surgeParameterUpdated(const SurgeSynthesizer::ID& id, float) override {
	}


private:
    int m_blockPos;
    double m_sampleTimeMs;
    SequenceProcessor m_sequenceProcessor;
    EventHolder m_eventPool;
	std::unique_ptr<SurgeSynthesizer> m_surge;


	// Inherited via IInstrument
	virtual void prepareForProcessing(double sampleRate, size_t expectedBlockSize) override {
        m_surge->setSamplerate(sampleRate);
        m_sampleTimeMs = 1.0 / sampleRate / 1000;
	}

    int getMidiNote(double freq) {
        return std::round(log(freq / 440.0) / log(2) * 12 + 69);
    }

	virtual void processBlock(audio::AudioBuffer& buffer, const SequenceTrack& track) override {
        m_sequenceProcessor.setSequenceTrack(track);

        while (true) {
            auto event = m_sequenceProcessor.getNextEvent();
            if (!event.has_value()) {
                break;
            }

            // put this after
            int sample = event->relativeTime.getMilliSeconds() / m_sampleTimeMs;
            if (event->event->values.count("frequency")) {
                auto midi = getMidiNote(event->event->values["frequency"]->getValue());
                if (midi >= 0) {

                    m_surge->playNote(1, midi, 127, 0);
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
                m_surge->releaseNote(1, midi, 127);
            }

        }
        auto data = buffer.getWriteData();
        for (int i = 0; i < buffer.getNumSamples(); i++)
        {
            if (m_blockPos == 0) {
                m_surge->process();
            }

            data[0][i] = m_surge->output[0][m_blockPos];
            data[1][i] = m_surge->output[1][m_blockPos];

            m_blockPos = (m_blockPos + 1) % BLOCK_SIZE;
        }
	}

	virtual void processingEnded() override {
	}

	virtual void setSequence(std::unique_ptr<Sequence>& sequence) override {
        m_sequenceProcessor.setSequence(sequence);
	}

};

}
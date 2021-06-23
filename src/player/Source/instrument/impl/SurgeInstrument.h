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
    enum class EventType {ON, OFF};

    int m_blockPos;
    double m_sampleTimeMs;
    SequenceProcessor<std::shared_ptr<Event>> m_sequenceProcessor;
    EventHolder<std::shared_ptr<Event>> m_onEventPool;
    EventHolder<std::shared_ptr<Event>> m_offEventPool;
	std::unique_ptr<SurgeSynthesizer> m_surge;


	// Inherited via IInstrument
	virtual void prepareForProcessing(double sampleRate, size_t expectedBlockSize) override {
        m_surge->setSamplerate(sampleRate);
        m_sampleTimeMs = 1.0 / sampleRate * 1000;
	}

    int getMidiNote(double freq) {
        return std::round(log(freq / 440.0) / log(2) * 12 + 69);
    }



	virtual void processBlock(audio::AudioBuffer& buffer, const SequenceTrack& track) override {
        m_sequenceProcessor.consume(track, [this](auto event) {
            m_onEventPool.addEvent(event.event, event.relativeTime);
            m_offEventPool.addEvent(event.event, event.relativeTime + event.event->duration);
        });
        
        

        auto data = buffer.getWriteData();
        for (int i = 0; i < buffer.getNumSamples(); i++)
        {
            if (m_blockPos == 0) {
                SequenceTime time = SequenceTime::FromMilliseconds(m_sampleTimeMs * BLOCK_SIZE);
                m_offEventPool.consume(time, [this](auto event) {
                    if (event.event->values.count("frequency")) {
                        auto freq = event.event->values["frequency"];
                        if (std::holds_alternative<double>(freq)) {
                            double freqValue = std::get<double>(freq);
                            auto midi = getMidiNote(freqValue);
                            if (midi >= 0) {
                                m_surge->releaseNote(1, midi, 127);
                            }
                        }
                        
                    }
                });
                m_onEventPool.consume(time, [this](auto event) {
                    auto& values = event.event->values;
                    if (values.count("frequency") && std::holds_alternative<double>(values["frequency"])) {
                        
                        auto midi = getMidiNote(std::get<double>(values["frequency"]));
                        if (midi >= 0) {
                            m_surge->playNote(1, midi, 127, 0);
                        }
                    }
                });
                m_surge->process();
            }

            data[0][i] = m_surge->output[0][m_blockPos];
            data[1][i] = m_surge->output[1][m_blockPos];

            m_blockPos = (m_blockPos + 1) % BLOCK_SIZE;
        }
	}

	virtual void processingEnded() override {
	}

	virtual void setSequence(std::unique_ptr<Sequence<std::shared_ptr<Event>>>& sequence) override {
        m_sequenceProcessor.setSequence(sequence);
	}

    virtual void clearSequence() {
        m_sequenceProcessor.clearSequence();
    }

};

}
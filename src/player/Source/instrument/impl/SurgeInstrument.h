#pragma once

#ifndef _USE_MATH_DEFINES
    #define _USE_MATH_DEFINES
#endif
#include <cmath>

#include "IInstrument.h"
#include "SurgeSynthesizer.h"
#include "SequenceProcessor.h"
#include "AudioBufferOperations.h"
#include <fstream>
#include <algorithm>
#include <cctype>
#include <string>
#include <regex>


namespace phrasa::instrument::impl {


class SurgeInstrument : public IInstrument, public SurgeSynthesizer::PluginLayer {
public:
	SurgeInstrument() :
        m_blockPos(0),
        m_sampleTimeMs(0),
        m_surge(new SurgeSynthesizer(this,"SurgeXTData"))
    {
        
        m_surge->storage.initializePatchDb(); 
    }

    void setPatch(int patchNumber) {
        m_surge->loadPatch(patchNumber);

    }

	void surgeParameterUpdated(const SurgeSynthesizer::ID& id, float) override {
	}

    static void initPatchMap(std::map<std::string, int>& res) {
        std::unique_ptr<SurgeSynthesizer> surge(new SurgeSynthesizer(nullptr, "SurgeXTData"));
        surge->storage.initializePatchDb();
        std::set<std::string> existedNames;
        for (int i = 0; i < surge->storage.patch_list.size(); ++i) {
            if (surge->storage.patch_list[i].name.size() == 0) {
                continue;
            }
            std::string newName = formatPatchName(surge->storage.patch_list[i].name, existedNames);
            res[newName] = i;
            existedNames.insert(newName);
        }
        //createPatchDocs(*surge);
    }
    
private:
    enum class EventType {ON, OFF};

    int m_blockPos;
    double m_sampleTimeMs;
    SequenceProcessor<std::shared_ptr<Event>> m_sequenceProcessor;
    EventHolder<std::shared_ptr<Event>> m_onEventPool;
    EventHolder<std::shared_ptr<Event>> m_offEventPool;
	std::unique_ptr<SurgeSynthesizer> m_surge;

    static std::string formatPatchName(const std::string& name, std::set<std::string>& existedNames) {
        std::regex e("(\\s+-?\\s*)");   // matches words beginning by "sub"
        std::string newName = std::regex_replace(name, e, "-");
        newName.erase(std::remove(newName.begin(), newName.end(), ','), newName.end());
        newName.erase(std::remove(newName.begin(), newName.end(), '('), newName.end());
        newName.erase(std::remove(newName.begin(), newName.end(), ')'), newName.end());

        std::transform(newName.begin(), newName.end(), newName.begin(),
            [](unsigned char c) { return std::tolower(c); });

        if (existedNames.count(newName) > 0) {
            newName.push_back('-');
            std::string uniqueName;
            for (int i = 1; true; ++i) {
                std::string uniqueName = newName + std::to_string(i);
                if (existedNames.count(uniqueName) == 0) {
                    break;
                }
            }
            newName = uniqueName;
        }
        return newName;
    }

    static void createPatchDocs(SurgeSynthesizer& surgeSynth) {
        std::ofstream out("C:\\Users\\erez\\Desktop\\synths.txt");
        std::map<std::string, std::vector<std::string>> patchcategories;
        for (auto& patch : surgeSynth.storage.patch_list) {
            if (patchcategories.count(surgeSynth.storage.patch_category[patch.category].name) == 0) {
                patchcategories[surgeSynth.storage.patch_category[patch.category].name] = std::vector<std::string>();
            }
            patchcategories[surgeSynth.storage.patch_category[patch.category].name].push_back(patch.name);
        }
        std::set<std::string> existedNames;

        for (auto& category : patchcategories) {
            if (category.second.size() == 0) {
                continue;
            }
            out << "### " << category.first << std::endl << std::endl;
            out << "<ul style=\"list-style-type:none;columns:3\">" << std::endl;
            for (auto patchname : category.second) {
                std::string newName = formatPatchName(patchname, existedNames);

                out << "<li>" << newName << "</li>" << std::endl;;
                existedNames.insert(newName);
            }
            out << "</ul>" << std::endl;

            out << std::endl;

        }

        out.close();

    }

    

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
                    auto& values = event.event->values;
                    if (values.count("frequency")) {
                        auto freq = values["frequency"];
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
        audio::AudioBufferOperations::gain(buffer,0.2);

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

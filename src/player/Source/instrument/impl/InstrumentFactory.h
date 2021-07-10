#pragma once

#include <string>
#include <map>

#include "SurgeInstrument.h"
#include "ProducerConsumerQueue.h"
#include "IInstrumentFactory.h"
#include "SamplerInstrument.h"
namespace phrasa::instrument::impl {

class InstrumentFactory : public IInstrumentFactory
{
    const int MAX_PENDING_SURGE_INSTRUMENTS = 5;
public:
    InstrumentFactory();
    virtual std::unique_ptr<IInstrument> createInstrument(std::string instrumentType) override;
private:
    void initSampleSettings();

    std::map<std::string, SamplerSettings> m_samplerSettings;
    static std::map<std::string, double> samplersGains;
    std::map<std::string, int> m_surgePatchMap;
    ProducerConsumerQueue<SurgeInstrument> m_surgeInstrumentQueue;
};


}
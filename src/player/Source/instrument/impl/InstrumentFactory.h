#pragma once

#include <string>
#include <map>

#include "SurgeInstrument.h"
#include "ProducerConsumerQueue.h"
#include "IInstrumentFactory.h"

namespace phrasa::instrument::impl {

class InstrumentFactory : public IInstrumentFactory
{
    const int MAX_PENDING_SURGE_INSTRUMENTS = 5;
public:
    InstrumentFactory();
    virtual std::unique_ptr<IInstrument> createInstrument(std::string instrumentType) override;
private:
    std::map<std::string, int> m_surgePatchMap;
    ProducerConsumerQueue<SurgeInstrument> m_surgeInstrumentQueue;
};


}
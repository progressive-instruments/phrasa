#pragma once

#include <string>
#include <map>
#include "IInstrumentFactory.h"

namespace phrasa::instrument::impl {

class InstrumentFactory : public IInstrumentFactory
{
public:
    InstrumentFactory();
    virtual std::unique_ptr<IInstrument> createInstrument(std::string instrumentType) override;
private:
    std::map<std::string, int> m_surgePatchMap;
};


}
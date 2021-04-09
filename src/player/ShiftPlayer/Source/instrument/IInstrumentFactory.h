#pragma once

#include "IInstrument.h"

namespace shift::instrument {

class IInstrumentFactory
{
public:
    /**
     * @brief create instrument of type
     * @param instrumentType 
     * @return 
    */
    virtual std::unique_ptr<IInstrument> createInstrument(InstrumentType instrumentType) = 0;
};

}
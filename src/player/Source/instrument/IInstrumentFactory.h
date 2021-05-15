#pragma once

#include "IInstrument.h"

namespace phrasa::instrument {
namespace builtin {
    static const char* BASS = "bass";
    static const char* LEAD = "lead";
}


class IInstrumentFactory
{
public:
    virtual ~IInstrumentFactory() {}
    /**
     * @brief create instrument of type
     * @param instrumentType 
     * @return 
    */
    virtual std::unique_ptr<IInstrument> createInstrument(std::string instrumentType) = 0;
};

}
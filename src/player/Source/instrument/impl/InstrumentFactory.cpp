#include "IInstrumentFactory.h"
#include "InstrumentFactory.h"
#include "SurgeInstrument.h"
#include "SineSynth.h"
namespace phrasa::instrument::impl {

std::unique_ptr<IInstrument> InstrumentFactory::createInstrument(InstrumentType instrumentType)
{
		return std::unique_ptr<IInstrument>(new SurgeInstrument(2));
}

}
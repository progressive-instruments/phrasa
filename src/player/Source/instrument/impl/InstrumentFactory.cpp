#include "IInstrumentFactory.h"
#include "InstrumentFactory.h"
#include "SurgeInstrument.h"
#include "SineSynth.h"
namespace phrasa::instrument::impl {



std::unique_ptr<IInstrument> InstrumentFactory::createInstrument(std::string instrumentType)
{

	if (instrumentType == builtin::BASS) {
		return std::unique_ptr<IInstrument>(new SurgeInstrument(4));
	} else if (instrumentType == builtin::LEAD) {
		return std::unique_ptr<IInstrument>(new SurgeInstrument(7));
	}
	throw std::invalid_argument("unknown instrument type " + instrumentType);
}

}
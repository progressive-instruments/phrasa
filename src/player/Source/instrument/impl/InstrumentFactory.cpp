#include "IInstrumentFactory.h"
#include "InstrumentFactory.h"
#include "SurgeInstrument.h"
#include "SineSynth.h"
#include "SamplerInstrument.h"

namespace phrasa::instrument::impl {

InstrumentFactory::InstrumentFactory()
{
	SurgeInstrument::initPatchMap(m_surgePatchMap);
}

std::unique_ptr<IInstrument> InstrumentFactory::createInstrument(std::string instrumentType)
{
	static const std::string dir = "C:\\Users\\erez\\Desktop\\dev\\samples";
	if (m_surgePatchMap.count(instrumentType) > 0) {
		return std::unique_ptr<IInstrument>(new SurgeInstrument(m_surgePatchMap[instrumentType]));
	}
	if (instrumentType == builtin::DRUMS) {
		std::vector<SampleSettings> samps;
		samps.push_back(SampleSettings("kick", dir + "\\kick.wav"));
		samps.push_back(SampleSettings("hi-closed", dir + "\\hi_closed.wav"));
		samps.push_back(SampleSettings("hi-open", dir + "\\hi_open.wav"));
		samps.push_back(SampleSettings("snare", dir + "\\snare.wav"));
		samps.push_back(SampleSettings("clap", dir + "\\clap.wav"));

		return std::unique_ptr<IInstrument>(new SamplerInstrument(samps));
	}
	throw std::invalid_argument("unknown instrument type " + instrumentType);
}

}
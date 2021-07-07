#include "InstrumentFactory.h"
#include "SineSynth.h"
#include "SamplerInstrument.h"

namespace phrasa::instrument::impl {

InstrumentFactory::InstrumentFactory()
	:m_surgeInstrumentQueue([]{return std::unique_ptr<SurgeInstrument>(new SurgeInstrument());}, MAX_PENDING_SURGE_INSTRUMENTS)
{
	SurgeInstrument::initPatchMap(m_surgePatchMap);
}


std::unique_ptr<IInstrument> InstrumentFactory::createInstrument(std::string instrumentType)
{
	static const std::string dir = "C:\\Users\\erez\\Desktop\\dev\\samples";
	if (m_surgePatchMap.count(instrumentType) > 0) {
		auto surgeInst = m_surgeInstrumentQueue.consume();
		surgeInst->setPatch(m_surgePatchMap[instrumentType]);
		return std::move(surgeInst);
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
#include "IInstrumentFactory.h"
#include "InstrumentFactory.h"
#include "SurgeInstrument.h"
#include "SineSynth.h"
#include "SamplerInstrument.h"

namespace phrasa::instrument::impl {


std::unique_ptr<IInstrument> InstrumentFactory::createInstrument(std::string instrumentType)
{
	static const std::string dir = "C:\\Users\\erez\\Desktop\\dev\\samples";

	if (instrumentType == builtin::BASS) {
		return std::unique_ptr<IInstrument>(new SurgeInstrument(4));
	} else if (instrumentType == builtin::LEAD) {
		return std::unique_ptr<IInstrument>(new SurgeInstrument(7));
	}
	else if (instrumentType == builtin::DRUMS) {
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
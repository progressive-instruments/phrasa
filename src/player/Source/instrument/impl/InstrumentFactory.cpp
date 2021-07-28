#include "InstrumentFactory.h"
#include "SineSynth.h"
#include "SamplerInstrument.h"
#include "juce_core/juce_core.h"

namespace phrasa::instrument::impl {

std::map<std::string, double> InstrumentFactory::samplersGains = {
	{ "drumatic", 1.0 },
	{ "drums", 1.0 },
	{ "drum-machine", 0.5 },
	{ "mattel", 1.0 },
	{ "snares", 1.0 },
};
InstrumentFactory::InstrumentFactory()
	:m_surgeInstrumentQueue([]{return std::unique_ptr<SurgeInstrument>(new SurgeInstrument());}, MAX_PENDING_SURGE_INSTRUMENTS)
{

	SurgeInstrument::initPatchMap(m_surgePatchMap);
	initSampleSettings();
}

void to_lower(std::string& data) {
	std::transform(data.begin(), data.end(), data.begin(),
		[](unsigned char c) { return std::tolower(c); });
}

void InstrumentFactory::initSampleSettings() {
	static const std::string dirName = "phrasa-samples";
	auto exeDir = juce::File::getSpecialLocation(juce::File::SpecialLocationType::currentApplicationFile).getParentDirectory();
	auto dir = exeDir.getChildFile(dirName).getFullPathName().toStdString();
	if (fs::exists(dir)) {
		for (auto& instrumentDir : fs::directory_iterator(dir)) {
			if (instrumentDir.is_directory()) {
				std::string instrumentName = instrumentDir.path().filename().string();
				to_lower(instrumentName);
				m_samplerSettings[instrumentName] = SamplerSettings();
				for (auto& file : fs::directory_iterator(instrumentDir)) {
					std::string extension = file.path().extension().string();
					if (extension == ".wav") {
						std::string sampleName = file.path().stem().string();
						to_lower(sampleName);
						m_samplerSettings[instrumentName].samples.push_back(SampleSettings(sampleName, file.path().string()));
					}
				}
				if (samplersGains.count(instrumentName) > 0) {
					m_samplerSettings[instrumentName].totalGain = samplersGains[instrumentName];
				}
			}
		}
	}
}

std::unique_ptr<IInstrument> InstrumentFactory::createInstrument(std::string instrumentType)
{
	if (m_surgePatchMap.count(instrumentType) > 0) {
		auto surgeInst = m_surgeInstrumentQueue.consume();
		surgeInst->setPatch(m_surgePatchMap[instrumentType]);
		return std::move(surgeInst);
	}
	if (m_samplerSettings.count(instrumentType)) {
		return std::unique_ptr<IInstrument>(new SamplerInstrument(m_samplerSettings[instrumentType]));
	}
	throw std::invalid_argument("unknown instrument type " + instrumentType);
}

}
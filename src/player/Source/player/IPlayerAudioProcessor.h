#pragma once

#include <cstdint>

#include "AudioBuffer.h"

namespace phrasa::player {


class IPlayerAudioProcessor
{
public:
	virtual ~IPlayerAudioProcessor() {}

	virtual void prepareForProcessing(double sampleRate, size_t expectedBlockSize) = 0;
	virtual void processBlock(audio::AudioBuffer& buffer) = 0;
	virtual void processingEnded() = 0;
};

}
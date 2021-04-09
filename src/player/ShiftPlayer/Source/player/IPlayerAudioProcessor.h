#pragma once

#include <cstdint>

#include "AudioBuffer.h"

namespace shift::player {


class IPlayerAudioProcessor
{
public:
	virtual void prepareForProcessing(unsigned int sampleRate, size_t expectedBlockSize) = 0;
	virtual void processBlock(audio::AudioBuffer& buffer) = 0;
	virtual void processingEnded() = 0;
};

}
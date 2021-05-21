#pragma once

#include "AudioBuffer.h"
#include "juce_audio_basics/juce_audio_basics.h"

namespace phrasa::player::impl {


class AudioBufferOperations {
public:
	inline static void clear(audio::AudioBuffer& dest) {
		for (int i = 0; i < dest.getNumChannels(); ++i) {
			juce::FloatVectorOperations::clear(dest.getWriteData()[i], dest.getNumSamples());
		}
	}

	inline static void gain(audio::AudioBuffer& dest, float factor) {
		for (int i = 0; i < dest.getNumChannels(); ++i) {
			juce::FloatVectorOperations::multiply(dest.getWriteData()[i], factor, dest.getNumSamples());
		}
	}

	inline static void add(const audio::AudioBuffer& src, audio::AudioBuffer& dest) {
		validateEqual(src, dest);
		for (int i = 0; i < src.getNumChannels(); ++i) {
			juce::FloatVectorOperations::add(dest.getWriteData()[i], src.getReadData()[i], src.getNumSamples());
		}
	}

	inline static void copy(const audio::AudioBuffer& src, audio::AudioBuffer& dest) {
		validateEqual(src, dest);
		for (int i = 0; i < src.getNumChannels(); ++i) {
			juce::FloatVectorOperations::copy(dest.getWriteData()[i], src.getReadData()[i], src.getNumSamples());
		}
	}
private:
	inline static void validateEqual(const audio::AudioBuffer& src, const audio::AudioBuffer& dest) {
		if (src.getNumChannels() != dest.getNumChannels() || src.getNumSamples() != dest.getNumSamples()) {
			throw new std::runtime_error("buffer are not equal in size");
		}
	}
};

}

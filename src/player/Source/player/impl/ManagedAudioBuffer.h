#pragma once

#include <vector>
#include "AudioBuffer.h"

namespace phrasa::player::impl {

class ManagedAudioBuffer : public audio::AudioBuffer {
public:
	ManagedAudioBuffer()
	:m_numSamples(0)
	{}

	void setChannels(int totalChannels) {
		if (m_channels.size() == totalChannels) {
			return;
		}
		m_channels.resize(totalChannels);
		resetBuffer();
	}

	void setNumSamples(size_t totalSamples) {
		if (totalSamples == m_numSamples) {
			return;
		}
		m_numSamples = totalSamples;
		resetBuffer();
	}
	const float* const* getReadData() const override {
		return m_channels.data();
	}

	float* const* getWriteData() override {
		return m_channels.data();
	}

	unsigned int getNumChannels() const override {
		return (int)m_channels.size();
	}

	size_t getNumSamples() const override {
		return m_numSamples;
	}
private:

	void resetBuffer() {

		m_linearBuffer.resize(m_numSamples * m_channels.size());

		for (int i = 0; i < m_channels.size(); ++i) {
			m_channels[i] = m_linearBuffer.data() + i * m_numSamples;
		}
	}

	std::vector<float> m_linearBuffer;
	std::vector<float*> m_channels;
	size_t m_numSamples;
};

}
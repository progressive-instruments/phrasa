#pragma once

namespace shift::audio {
  struct AudioBuffer
  {
	  float* const * data;
	  unsigned int numChannels;
	  size_t numSamples;
  };
}
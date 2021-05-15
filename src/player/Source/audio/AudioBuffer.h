#pragma once

namespace phrasa::audio {
  class AudioBuffer
  {
  public:
	  virtual const float* const * getReadData() const =0;
	  virtual float* const * getWriteData() =0;
	  virtual unsigned int getNumChannels() const  =0;
	  virtual size_t getNumSamples()const =0;
  };
}
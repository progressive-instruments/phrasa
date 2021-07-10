add_library(audio INTERFACE)

set_property(TARGET audio PROPERTY CXX_STANDARD 17)

target_sources( audio
  PRIVATE
    AudioBuffer.h 
    AudioBufferOperations.h)

target_include_directories(audio INTERFACE .)
add_library(instrument impl/InstrumentFactory.cpp)

add_subdirectory(impl/surge)

target_sources( instrument
  PRIVATE
    impl/SineSynth.h
    impl/SequenceProcessor.h
    IInstrument.h
    IInstrumentFactory.h
    SequenceTrack.h
    impl/SamplerInstrument.h
    impl/InstrumentFactory.h
    impl/SurgeInstrument.h)

    
target_compile_definitions(instrument PRIVATE
  _USE_MATH_DEFINES
  JUCE_GLOBAL_MODULE_SETTINGS_INCLUDED=1)



target_link_libraries(instrument 
  PUBLIC 
  audio 
  surge-shared)

target_include_directories(instrument 
  PRIVATE
  ../../JUCE/modules
  impl/surge/src/common
  PUBLIC 
    .
    ../event)



#Tests
add_executable( sequenceProcessorTests tests/SequenceProcessorTests.cpp )
target_link_libraries(sequenceProcessorTests instrument gtest gtest_main)
add_test( sequenceProcessorTests sequenceProcessorTests )
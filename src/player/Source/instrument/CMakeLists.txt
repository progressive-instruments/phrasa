add_library(instrument impl/InstrumentFactory.cpp)

target_sources( instrument
  PRIVATE
    impl/SineSynth.h
    impl/SequenceProcessor.h
    IInstrument.h
    IInstrumentFactory.h
    SequenceTrack.h
    impl/InstrumentFactory.h)

    
target_compile_definitions(instrument PRIVATE
  JUCE_GLOBAL_MODULE_SETTINGS_INCLUDED=1)

target_link_libraries(instrument audio)

target_include_directories(instrument 
  PRIVATE
  ../../JUCE/modules
  PUBLIC 
    .
    ../event)


#Tests
add_executable( sequenceProcessorTests tests/SequenceProcessorTests.cpp )
target_link_libraries(sequenceProcessorTests instrument gtest gtest_main)
add_test( sequenceProcessorTests sequenceProcessorTests )
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
  PUBLIC 
    .
    ../event
    ../../JUCE/modules)


#Tests
# add_executable( instrumentTests tests/instrumentTest.cpp )
# target_link_libraries(instrumentTests instrument gtest gtest_main)
# add_test( instrumentTests instrumentTests )
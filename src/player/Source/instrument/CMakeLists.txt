add_library(instrument impl/InstrumentFactory.cpp)

add_subdirectory(impl/surge)

target_sources( instrument
  PRIVATE
    impl/SineSynth.h
    impl/SequenceProcessor.h
    impl/MPEEventPerChannelHolder.h
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
  surge-shared
  utils)

target_include_directories(instrument 
  PRIVATE
  ../../JUCE/modules
  impl/surge/src/common
  PUBLIC 
    .
    ../event)



juce_add_console_app(instrumentTests
    PRODUCT_NAME "InstrumentTests")     # The name of the final executable, which can differ from the target name

target_sources(instrumentTests
    PRIVATE
      tests/instrumentTests.cpp)

target_link_libraries(instrumentTests
    PRIVATE
        # GuiAppData            # If we'd created a binary data target, we'd link to it here
        juce::juce_audio_basics
        juce::juce_audio_devices
        juce::juce_audio_formats
        juce::juce_audio_processors
        juce::juce_audio_utils
        juce::juce_core
        juce::juce_data_structures
        juce::juce_events
        instrument
        gtest
        gtest_main
    PUBLIC
        juce::juce_recommended_config_flags
        juce::juce_recommended_lto_flags
        juce::juce_recommended_warning_flags)

add_test( instrumentTests instrumentTests )
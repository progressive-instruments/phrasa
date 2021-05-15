cmake_minimum_required(VERSION 3.15)

set_property(GLOBAL PROPERTY USE_FOLDERS ON) # required for oredering projects within solution
# set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")

project(PhrasaPlayer VERSION 0.0.1)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

add_subdirectory(JUCE)                    # If you've put JUCE in a subdirectory called JUCE
add_subdirectory(googletest)                    # If you've put JUCE in a subdirectory called JUCE
add_subdirectory(Source/connection)
add_subdirectory(Source/audio)
add_subdirectory(Source/event)
add_subdirectory(Source/player)
add_subdirectory(Source/player_controller)
add_subdirectory(Source/instrument)

include_directories(${gtest_SOURCE_DIR}/include ${gtest_SOURCE_DIR})

juce_add_gui_app(${PROJECT_NAME}
    # VERSION ...                       # Set this if the app version is different to the project version
    # ICON_BIG ...                      # ICON_* arguments specify a path to an image file to use as an icon
    # ICON_SMALL ...
    # DOCUMENT_EXTENSIONS ...           # Specify file extensions that should be associated with this app
    # COMPANY_NAME ...                  # Specify the name of the app's author
    PRODUCT_NAME "PhrasaPlayer")     # The name of the final executable, which can differ from the target name

target_sources(${PROJECT_NAME}
    PRIVATE
        Source/PhrasaPlayerApp.cpp
        Source/PhrasaPlayerApp.h
        Source/JuceMain.cpp)


target_compile_definitions(${PROJECT_NAME}
    PRIVATE
        # JUCE_WEB_BROWSER and JUCE_USE_CURL would be on by default, but you might not need them.
        JUCE_WEB_BROWSER=0  # If you remove this, add `NEEDS_WEB_BROWSER TRUE` to the `juce_add_gui_app` call
        JUCE_USE_CURL=0     # If you remove this, add `NEEDS_CURL TRUE` to the `juce_add_gui_app` call
        JUCE_APPLICATION_NAME_STRING="$<TARGET_PROPERTY:PhrasaPlayer,JUCE_PRODUCT_NAME>"
        JUCE_APPLICATION_VERSION_STRING="$<TARGET_PROPERTY:PhrasaPlayer,JUCE_VERSION>")

target_link_libraries(${PROJECT_NAME}
    PRIVATE
        # GuiAppData            # If we'd created a binary data target, we'd link to it here
        juce::juce_gui_extra
        juce::juce_audio_basics
        juce::juce_audio_devices
        juce::juce_audio_formats
        juce::juce_audio_processors
        juce::juce_audio_utils
        juce::juce_core
        juce::juce_data_structures
        juce::juce_events
        juce::juce_graphics
        juce::juce_gui_basics
        event
        audio
        connection
        instrument
        player
        player_controller
    PUBLIC
        juce::juce_recommended_config_flags
        juce::juce_recommended_lto_flags
        juce::juce_recommended_warning_flags)

target_include_directories(${PROJECT_NAME} PUBLIC "Source")

source_group(juce REGULAR_EXPRESSION juce_.*)

set_target_properties (gmock gmock_main gtest gtest_main PROPERTIES
    FOLDER googletest
)

set(SURGE_TARGETS
  surge-xt
  surge-xt_All
  surge-xt_Standalone
  surge-xt_VST3
  surge-fx
  surge-fx_All
  surge-fx_Standalone
  surge-fx_VST3
  airwindows
  ci-pull-req
  code-quality-pipeline-checks
  download-extra-content
  eurorack
  git-info
  oddsound-mts
  sqlite
  stage-extra-content
  Surge-Effects-Bank-Packaged
  surge-fx-binary
  surge-headless
  surge-shared
  surge-shared-binary
  surge-staged-assets
  surge-staged-nonbuilt-assets
  surge-xt-binary
  surge-xt-distribution
  Surge-XT-Packaged
  surge-xt-run-standalone
  tinyxml
  )

set_target_properties (${SURGE_TARGETS} PROPERTIES
    FOLDER surge
)

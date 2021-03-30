cmake_minimum_required(VERSION 3.15)

project(ShiftPlayer VERSION 0.0.1)

add_subdirectory(JUCE)                    # If you've put JUCE in a subdirectory called JUCE

juce_add_gui_app(ShiftPlayer
    # VERSION ...                       # Set this if the app version is different to the project version
    # ICON_BIG ...                      # ICON_* arguments specify a path to an image file to use as an icon
    # ICON_SMALL ...
    # DOCUMENT_EXTENSIONS ...           # Specify file extensions that should be associated with this app
    # COMPANY_NAME ...                  # Specify the name of the app's author
    PRODUCT_NAME "ShiftPlayer")     # The name of the final executable, which can differ from the target name

target_sources(${PROJECT_NAME}
    PRIVATE
        Source/Communication.cpp
        Source/ShiftPlayerApp.cpp
        Source/JuceMain.cpp
        ProtoBuff/note_message.pb.cc)

target_compile_definitions(${PROJECT_NAME}
    PRIVATE
        # JUCE_WEB_BROWSER and JUCE_USE_CURL would be on by default, but you might not need them.
        JUCE_WEB_BROWSER=0  # If you remove this, add `NEEDS_WEB_BROWSER TRUE` to the `juce_add_gui_app` call
        JUCE_USE_CURL=0     # If you remove this, add `NEEDS_CURL TRUE` to the `juce_add_gui_app` call
        JUCE_APPLICATION_NAME_STRING="$<TARGET_PROPERTY:ShiftPlayer,JUCE_PRODUCT_NAME>"
        JUCE_APPLICATION_VERSION_STRING="$<TARGET_PROPERTY:ShiftPlayer,JUCE_VERSION>")

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
        debug "C:/protobuf/debug/lib/libprotobufd.lib"
        optimized "C:/protobuf/lib/libprotobuf.lib"
    PUBLIC
        juce::juce_recommended_config_flags
        juce::juce_recommended_lto_flags
        juce::juce_recommended_warning_flags)

target_include_directories(${PROJECT_NAME} PUBLIC ProtoBuff "C:/protobuf/include")
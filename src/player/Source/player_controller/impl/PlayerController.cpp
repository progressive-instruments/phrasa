
#include "PlayerController.h"
#include <ctime>
#include "juce_core/juce_core.h"

using namespace phrasa::playerctrl::impl;

PlayerController::MessageHandlerMap PlayerController::m_messageHandlers = {
    {shift_processor::ShiftPlayerMessage::MessageCase::kSetSequence, PlayerController::setSequenceHandler},
    {shift_processor::ShiftPlayerMessage::MessageCase::kSetPlayMode, PlayerController::setPlayModeHandler},

};

std::map<shift_processor::PlayMode, phrasa::player::PlayMode> PlayerController::playModeMap = {
    {shift_processor::PlayMode::Pause, phrasa::player::PlayMode::Pause},
    {shift_processor::PlayMode::Play, phrasa::player::PlayMode::Play},
    {shift_processor::PlayMode::Stop, phrasa::player::PlayMode::Stop}
};

PlayerController::PlayerController(std::shared_ptr<player::IPlayer> player, std::shared_ptr<connection::IConnection> connection)
:
m_player(player),
m_connection(connection)
{
	m_commRoutineThread = std::thread(communicationRoutine, this);
}

void PlayerController::setSequenceHandler(player::IPlayer& player, const shift_processor::ShiftPlayerMessage& message)
{
    UniqueSequenceMap<std::shared_ptr<Event>> sequenceMap;
    SequenceTime sequenceLength;
    PlayerController::parseSetSequenceMessage(message.setsequence(), sequenceMap, sequenceLength);
    player.setSequence(std::move(sequenceMap), sequenceLength);
}

void PlayerController::setPlayModeHandler(player::IPlayer& player, const shift_processor::ShiftPlayerMessage& message)
{
    auto playModeMessage = message.setplaymode();
    player::PlayMode mode = playModeMap[playModeMessage.playmode()];
    player.setPlayMode(mode);
}

void PlayerController::parseSetSequenceMessage(const shift_processor::SetSequenceMessage& msg, UniqueSequenceMap<std::shared_ptr<Event>>& sequenceMapOutput, SequenceTime& sequenceLengthOut) {

    sequenceMapOutput.reset(new std::map<InstrumentID, std::unique_ptr<Sequence<std::shared_ptr<Event>>>>());
    for (auto instrumentEvents : msg.instrumentevents()) {
        const std::string& instrumentID = instrumentEvents.instrument();
        for (auto e : instrumentEvents.events()) {
            auto outputEvent = std::make_shared<Event>(SequenceTime::FromMilliseconds(e.duration()));
            auto values = e.values();
            for (auto val : values) {
                if (val.second.value_case() == shift_processor::EventValue::ValueCase::kNumericValue) {
                    outputEvent->values[val.first] = val.second.numericvalue();
                }
                else if (val.second.value_case() == shift_processor::EventValue::ValueCase::kStringValue)
                {
                    outputEvent->values[val.first] = val.second.stringvalue();
                }
                else {
                    throw std::runtime_error("player supported not supported value");
                }
                
            }
            if (sequenceMapOutput->count(instrumentID) == 0) {
                (*sequenceMapOutput)[instrumentID] = std::make_unique<Sequence<std::shared_ptr<Event>>>();
            }
            (*sequenceMapOutput)[instrumentID]->events.insert({ SequenceTime::FromMilliseconds(e.eventtime()), outputEvent });
        }
    }
    sequenceLengthOut = SequenceTime::FromMilliseconds(msg.sequencelength());
}



void phrasa::playerctrl::impl::PlayerController::communicationRoutine(PlayerController* controller)
{
    while (true)
    {
        controller->m_connection->waitForClientConnection(1000);

        try {
            while (true)
            {
                uint32_t messageSize;
                controller->m_connection->receive(&messageSize, sizeof(messageSize));


                messageSize = juce::ByteOrder::swapIfLittleEndian(messageSize);
                std::vector<uint8_t> buff(messageSize);
                controller->m_connection->receive(buff.data(), messageSize);
                shift_processor::ResponseStatus status = shift_processor::ResponseStatus::GeneralError;
                try {
                    shift_processor::ShiftPlayerMessage message;
                    if (!message.ParseFromArray(buff.data(), messageSize))
                    {
                        throw std::runtime_error("failed to parse sequence");
                    }
                    if (m_messageHandlers.find(message.message_case()) == m_messageHandlers.end()) {
                        throw std::runtime_error("unsupported message type");
                    }
                    m_messageHandlers[message.message_case()](*(controller->m_player), message);
                    status = shift_processor::ResponseStatus::Ok;
                }
                catch (std::exception& e) {

                    // setting sequenec failed...
                }
                shift_processor::ShiftPlayerResponse response;
                response.set_status(status);
                auto responseBytes = response.SerializeAsString();
                messageSize = responseBytes.size();
                messageSize = juce::ByteOrder::swapIfLittleEndian(messageSize);
                controller->m_connection->send(&messageSize, sizeof(uint32_t));
                controller->m_connection->send(responseBytes.c_str(), responseBytes.size());

            }
        }
        catch (connection::ConnectionClosedException& ex) {
            // log disconnected..
        }


    }
}



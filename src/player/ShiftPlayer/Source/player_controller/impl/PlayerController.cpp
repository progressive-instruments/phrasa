
#include "PlayerController.h"
#include <ctime>
#include "juce_core/juce_core.h"

using namespace shift::playerctrl::impl;

PlayerController::PlayerController(std::shared_ptr<player::IPlayer> player, std::shared_ptr<connection::IConnection> connection)
:
m_player(player),
m_connection(connection)
{
	m_commRoutineThread = std::thread(communicationRoutine, this);
}

class EventValue  : public shift::IEventValue
{
public:
    EventValue(double value)
    {
        m_value = value;
    }
    virtual double getValue() override { return m_value; };
private:
    double m_value;
};

void PlayerController::parseSetSequenceMessage(const shift_processor::SetSequenceMessage& msg, std::unique_ptr<shift::Sequence>& sequenceOutput, SequenceTime& sequenceLengthOut) {

    sequenceOutput.reset(new Sequence());
    for (auto e : msg.events()) {
        auto outputEvent = std::make_shared<Event>(SequenceTime::FromMilliseconds(e.duration()));
        auto values = e.values();
        for (auto val : values) {
            if (val.second.value_case() != shift_processor::EventValue::ValueCase::kNumericValue) {
                throw std::runtime_error("player supported only numberic values");
            }
            outputEvent->values[val.first] = std::unique_ptr<shift::IEventValue>(
                new EventValue(val.second.numericvalue()));;
        }
        sequenceOutput->events.insert({ SequenceTime::FromMilliseconds(e.eventtime()), outputEvent });
    }
    sequenceLengthOut = SequenceTime::FromMilliseconds(msg.sequencelength());
}

void shift::playerctrl::impl::PlayerController::communicationRoutine(PlayerController* controller)
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

                shift_processor::ShiftPlayerMessage message = shift_processor::ShiftPlayerMessage();
                if (!message.ParseFromArray(buff.data(), messageSize))
                {
                    throw std::runtime_error("failed to parse sequence");
                }
                if (message.message_case() != shift_processor::ShiftPlayerMessage::MessageCase::kSetSequence) {
                    throw std::runtime_error("unsupported message type");
                }
                std::unique_ptr<Sequence> sequence;
                SequenceTime sequenceLength;
                controller->parseSetSequenceMessage(message.setsequence(), sequence, sequenceLength);

                controller->m_player->setSequence(std::move(sequence), sequenceLength);
            }
        }
        catch (connection::ConnectionClosedException& ex) {
            // log disconnected..
        }


    }
}



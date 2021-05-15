
#include "PlayerController.h"
#include <ctime>
#include "juce_core/juce_core.h"

using namespace phrasa::playerctrl::impl;

PlayerController::PlayerController(std::shared_ptr<player::IPlayer> player, std::shared_ptr<connection::IConnection> connection)
:
m_player(player),
m_connection(connection)
{
	m_commRoutineThread = std::thread(communicationRoutine, this);
}

class EventValue  : public phrasa::IEventValue
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

void PlayerController::parseSetSequenceMessage(const shift_processor::SetSequenceMessage& msg, UniqueSequenceMap& sequenceMapOutput, SequenceTime& sequenceLengthOut) {

    sequenceMapOutput.reset(new std::map<InstrumentID, std::unique_ptr<Sequence>>());
    for (auto instrumentEvents : msg.instrumentevents()) {
        const std::string& instrumentID = instrumentEvents.instrument();
        for (auto e : instrumentEvents.events()) {
            auto outputEvent = std::make_shared<Event>(SequenceTime::FromMilliseconds(e.duration()));
            auto values = e.values();
            for (auto val : values) {
                if (val.second.value_case() != shift_processor::EventValue::ValueCase::kNumericValue) {
                    throw std::runtime_error("player supported only numberic values");
                }
                outputEvent->values[val.first] = std::unique_ptr<phrasa::IEventValue>(
                    new EventValue(val.second.numericvalue()));;
            }
            if (sequenceMapOutput->count(instrumentID) == 0) {
                (*sequenceMapOutput)[instrumentID] = std::make_unique<Sequence>();
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

                shift_processor::ShiftPlayerMessage message = shift_processor::ShiftPlayerMessage();
                if (!message.ParseFromArray(buff.data(), messageSize))
                {
                    throw std::runtime_error("failed to parse sequence");
                }
                if (message.message_case() != shift_processor::ShiftPlayerMessage::MessageCase::kSetSequence) {
                    throw std::runtime_error("unsupported message type");
                }
                UniqueSequenceMap sequenceMap;
                SequenceTime sequenceLength;
                controller->parseSetSequenceMessage(message.setsequence(), sequenceMap, sequenceLength);

                controller->m_player->setSequence(std::move(sequenceMap), sequenceLength);
            }
        }
        catch (connection::ConnectionClosedException& ex) {
            // log disconnected..
        }


    }
}



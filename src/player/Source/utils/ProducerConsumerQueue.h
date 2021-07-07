#pragma once

#include <functional>
#include <queue>
#include <mutex>
#include <condition_variable>

using namespace std::chrono_literals;

namespace phrasa
{
	template<class T>
	class ProducerConsumerQueue
	{
	public:
		ProducerConsumerQueue(std::function<std::unique_ptr<T>()> producer, int maxItems)
			: 
			m_maxItems(maxItems),
			m_producer(producer),
			m_producerRoutineState(ProducerRoutineState::RUNNING)
		{
			m_producerThread = std::thread(producerRoutine, this);
		}

		~ProducerConsumerQueue() 
		{
			m_producerRoutineState = ProducerRoutineState::STOPPING;
			while (m_producerRoutineState != ProducerRoutineState::STOPPED) {
				std::this_thread::sleep_for(100ms);
			}
		}

		std::unique_ptr<T> consume() {
			std::unique_lock<std::mutex> lock(m_queueMutex);
			m_queueConditionVar.wait(lock, [this]() {return !m_queue.empty();});
			auto item = std::move(m_queue.front());
			m_queue.pop();
			lock.unlock();
			m_queueConditionVar.notify_one();
			return std::move(item);
		}

	private:
		static void producerRoutine(ProducerConsumerQueue* instance) 
		{
			while (instance->m_producerRoutineState == ProducerRoutineState::RUNNING) {
				std::unique_lock<std::mutex> lock(instance->m_queueMutex);
				instance->m_queueConditionVar.wait(lock, [instance] () {return instance->m_queue.size() < instance->m_maxItems;});
				lock.unlock();
				auto item = instance->m_producer();
				lock.lock();
				instance->m_queue.push(std::move(item));
				lock.unlock();
				instance->m_queueConditionVar.notify_one();
			}
			instance->m_producerRoutineState = ProducerRoutineState::STOPPED;
		}

		enum class ProducerRoutineState 
		{
			RUNNING,
			STOPPING,
			STOPPED
		};

		std::queue<std::unique_ptr<T>> m_queue;
		std::condition_variable m_queueConditionVar;
		std::mutex m_queueMutex;
		std::function<std::unique_ptr<T>()> m_producer;
		std::thread m_producerThread;
		std::atomic<ProducerRoutineState> m_producerRoutineState;
		int m_maxItems;
	};
}
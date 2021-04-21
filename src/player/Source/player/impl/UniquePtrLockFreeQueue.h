#pragma once

#include <memory>
#include <boost/lockfree/queue.hpp>

namespace phrasa::player::impl {

template<class T>
class UniquePtrLockFreeQueue
{
public:
	UniquePtrLockFreeQueue(size_t elementsSize)
		:
		m_queue(elementsSize)
	{}

	bool push(std::unique_ptr<T>& item)
	{
		T* itemPtr = item.release();
		if (!m_queue.push(itemPtr))
		{
			item.reset(itemPtr);
			return false;
		}
		return true;
	}

	bool pop(std::unique_ptr<T>& output)
	{
		T* outputPtr;
		
		if (!m_queue.pop(outputPtr))
		{
			return false;
		}
		output.reset(outputPtr);
		return true;
	}
private:
	boost::lockfree::queue<T*> m_queue;
};

}
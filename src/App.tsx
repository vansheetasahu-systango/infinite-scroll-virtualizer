import React from 'react';
import { useInfiniteQuery,} from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import './index.css';


// Fetch data from the mock API
const fetchItems = async ({ pageParam = 1 }) => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/photos?page=${pageParam}&limit=10`
  );// https://6787e220c4a42c9161089db1.mockapi.io/items
  const data = await response.json();
  return { items: data, nextPage: data.length ? pageParam + 1 : undefined };
};

export default function App() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const items = data?.pages.flatMap((page) => page.items) || [];

  const parentRef = React.useRef(null);
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? items.length + 1 : items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  });

  // Trigger fetching next page when scrolled to the bottom
  React.useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    const lastItem = virtualItems.length > 0 ? virtualItems[virtualItems.length - 1] : undefined;
  
    if (lastItem && lastItem.index >= items.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [rowVirtualizer.getVirtualItems(), hasNextPage, isFetchingNextPage, fetchNextPage, items.length]);
  

  return (
    <> 
    <h1>infinit scroll</h1>
    <div ref={parentRef} className="list-container">
      <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const isLoaderRow = virtualItem.index >= items.length;
          return (
            <div
              key={virtualItem.index}
              className="list-item"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {isLoaderRow ? (hasNextPage ? 'Loading more...' : 'No more items') : `Item 
              ${items[virtualItem.index]?.id}
              `}
              {/* ${items[virtualItem.index]?.name}  */}
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
}
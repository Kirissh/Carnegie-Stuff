def bubble_sort(arr):
    """Sort a list in ascending order using bubble sort."""
    items = list(arr)
    n = len(items)

    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if items[j] > items[j + 1]:
                items[j], items[j + 1] = items[j + 1], items[j]
                swapped = True
        if not swapped:
            break

    return items


if __name__ == "__main__":
    sample = [64, 34, 25, 12, 22, 11, 90]
    print("Original:", sample)
    print("Sorted:  ", bubble_sort(sample))

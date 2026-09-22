use wasm_bindgen::prelude::*;

/// Pure Rust implementation of Merge Sort for i32.
/// Does not mutate the original array; returns a new sorted Vec<i32>.
/// Does not use `slice::sort`.
#[wasm_bindgen]
pub fn merge_sort_wasm(input: &[i32]) -> Vec<i32> {
    let mut arr = input.to_vec();
    let len = arr.len();
    if len <= 1 {
        return arr;
    }
    
    let mut temp = vec![0; len];
    split_merge(0, len, &mut arr, &mut temp);
    
    arr
}

fn split_merge(start: usize, end: usize, a: &mut [i32], b: &mut [i32]) {
    if end - start <= 1 {
        return;
    }
    let middle = start + (end - start) / 2;
    
    split_merge(start, middle, a, b);
    split_merge(middle, end, a, b);
    merge(start, middle, end, a, b);
}

fn merge(start: usize, middle: usize, end: usize, a: &mut [i32], b: &mut [i32]) {
    let mut i = start;
    let mut j = middle;
    
    for k in start..end {
        if i < middle && (j >= end || a[i] <= a[j]) {
            b[k] = a[i];
            i += 1;
        } else {
            b[k] = a[j];
            j += 1;
        }
    }
    
    for k in start..end {
        a[k] = b[k];
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_empty_array() {
        let input: [i32; 0] = [];
        let sorted = merge_sort_wasm(&input);
        assert_eq!(sorted, vec![]);
    }

    #[test]
    fn test_single_element() {
        let input = [42];
        let sorted = merge_sort_wasm(&input);
        assert_eq!(sorted, vec![42]);
    }

    #[test]
    fn test_two_elements() {
        let input = [42, 10];
        let sorted = merge_sort_wasm(&input);
        assert_eq!(sorted, vec![10, 42]);
    }

    #[test]
    fn test_already_sorted() {
        let input = [1, 2, 3, 4, 5];
        let sorted = merge_sort_wasm(&input);
        assert_eq!(sorted, vec![1, 2, 3, 4, 5]);
    }

    #[test]
    fn test_reverse_sorted() {
        let input = [5, 4, 3, 2, 1];
        let sorted = merge_sort_wasm(&input);
        assert_eq!(sorted, vec![1, 2, 3, 4, 5]);
    }

    #[test]
    fn test_duplicates() {
        let input = [3, 1, 2, 1, 3, 2];
        let sorted = merge_sort_wasm(&input);
        assert_eq!(sorted, vec![1, 1, 2, 2, 3, 3]);
    }

    #[test]
    fn test_negative_numbers() {
        let input = [3, -1, -5, 0, 2];
        let sorted = merge_sort_wasm(&input);
        assert_eq!(sorted, vec![-5, -1, 0, 2, 3]);
    }
}

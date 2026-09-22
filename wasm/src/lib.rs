use wasm_bindgen::prelude::*;

/// Multiplies two flat N x N matrices.
/// A and B are expected to be flat arrays of f32 with length N*N.
/// Returns a new flat array representing the C = A * B matrix.
/// Pure Rust implementation of matrix multiplication.
pub fn multiply_matrices(a: &[f32], b: &[f32], n: usize) -> Result<Vec<f32>, String> {
    let size = n * n;
    
    if a.len() != size || b.len() != size {
        return Err("Matrix dimensions do not match the provided N.".into());
    }

    let mut c = vec![0.0; size];

    for i in 0..n {
        for j in 0..n {
            let mut sum = 0.0;
            for k in 0..n {
                sum += a[i * n + k] * b[k * n + j];
            }
            c[i * n + j] = sum;
        }
    }

    Ok(c)
}

/// WebAssembly boundary wrapper
#[wasm_bindgen]
pub fn multiply_matrices_wasm(a: &[f32], b: &[f32], n: usize) -> Result<Vec<f32>, JsValue> {
    multiply_matrices(a, b, n).map_err(|e| JsValue::from_str(&e))
}

// Add simple Rust-side unit tests to ensure algorithmic correctness
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_multiply_2x2() {
        let a = vec![1.0, 2.0, 3.0, 4.0];
        let b = vec![5.0, 6.0, 7.0, 8.0];
        let result = multiply_matrices(&a, &b, 2).unwrap();
        assert_eq!(result, vec![19.0, 22.0, 43.0, 50.0]);
    }
    
    #[test]
    fn test_mismatched_dimensions() {
        let a = vec![1.0, 2.0];
        let b = vec![1.0, 2.0];
        assert!(multiply_matrices(&a, &b, 2).is_err());
    }
}

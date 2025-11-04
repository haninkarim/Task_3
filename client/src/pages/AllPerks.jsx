import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function AllPerks() {
  
 
  const [perks, setPerks] = useState([])

  const [searchQuery, setSearchQuery] = useState('')

 
  const [merchantFilter, setMerchantFilter] = useState('')

 
  const [uniqueMerchants, setUniqueMerchants] = useState([])

  
  const [loading, setLoading] = useState(true)

  
  const [error, setError] = useState('')

  // ==================== SIDE EFFECTS WITH useEffect HOOK ====================

 /*
 TODO: HOOKS TO IMPLEMENT
 * useEffect Hook #1: Initial Data Loading
 * useEffect Hook #2: Auto-search on Input Change

*/
useEffect(() => {
    loadAllPerks()
  }, [])
  useEffect(() => {
    const delay = setTimeout(() => {
      loadAllPerks()
    }, 500) // Debounce: wait 0.5s after typing

    return () => clearTimeout(delay)
  }, [searchQuery, merchantFilter]) 

  
  useEffect(() => {
    // Extract all merchant names from perks array
    const merchants = perks
      .map(perk => perk.merchant) // Get merchant from each perk
      .filter(merchant => merchant && merchant.trim()) // Remove empty/null values
    
    // Create array of unique merchants using Set
    // Set automatically removes duplicates, then we convert back to array
    const unique = [...new Set(merchants)]
    
    // Update state with unique merchants
    setUniqueMerchants(unique)
    
    // This effect depends on [perks], so it re-runs whenever perks changes
  }, [perks]) // Dependency: re-run when perks array changes

  
  async function loadAllPerks() {
    // Reset error state before new request
    setError('')
    
    // Show loading indicator
    setLoading(true)
    
    try {
      // Make GET request to /api/perks/all with query parameters
      const res = await api.get('/perks/all', {
        params: {
          // Only include search param if searchQuery is not empty
          search: searchQuery.trim() || undefined,
          // Only include merchant param if merchantFilter is not empty
          merchant: merchantFilter.trim() || undefined
        }
      })
      
      // Update perks state with response data
      setPerks(res.data.perks)
      
    } catch (err) {
      // Handle errors (network failure, server error, etc.)
      console.error('Failed to load perks:', err)
      setError(err?.response?.data?.message || 'Failed to load perks')
      
    } finally {
      // This block runs whether try succeeds or catch handles error
      // Always stop loading indicator
      setLoading(false)
    }
  }

  // ==================== EVENT HANDLERS ====================

  
  function handleSearch(e) {
    // Prevent default form submission behavior (page reload)
    e.preventDefault()
    
    // Immediately reload perks with current search and filter values
    // This bypasses the debounce delay for instant results
    loadAllPerks()
  }

  
  function handleReset() {
    // Reset search and filter states to empty
    // The useEffect with [searchQuery, merchantFilter] dependencies
    // will automatically trigger and reload all perks
    setSearchQuery('')
    setMerchantFilter('')
  }

  
  
    return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Perks</h1>
        <div className="text-sm text-zinc-600">
          Showing {perks.length} perk{perks.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Search / Filters */}
      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                <span className="material-symbols-outlined text-sm align-middle">search</span> Search by Name
              </label>
              <input
                type="text"
                className="input"
                placeholder="Enter perk name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <p className="text-xs text-zinc-500 mt-1">Auto-searches as you type</p>
            </div>

            {/* Merchant Dropdown */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                <span className="material-symbols-outlined text-sm align-middle">store</span> Filter by Merchant
              </label>
              <select
                className="input"
                value={merchantFilter}
                onChange={(e) => setMerchantFilter(e.target.value)}
              >
                <option value="">All Merchants</option>
                {uniqueMerchants.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Buttons */}
          <div className="flex gap-3 items-center">
            <button type="submit" className="btn bg-blue-600 text-white">
              Search Now
            </button>
            <button type="button" onClick={handleReset} className="btn">
              Reset Filters
            </button>

            {loading && (
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                Loading...
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Error banner */}
      {error && (
        <div className="card border-red-200 bg-red-50 text-red-600 flex justify-between items-center p-4">
          <span>{error}</span>
          <button onClick={loadAllPerks} className="btn text-sm">Try Again</button>
        </div>
      )}

      {/* Perks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {perks.map(perk => (
          <Link
            key={perk._id}
            to={`/perks/${perk._id}`}
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="font-semibold text-lg text-zinc-900 mb-2">{perk.title}</div>

            <div className="text-sm text-zinc-600 space-y-1">
              {perk.merchant && <div className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">store</span>{perk.merchant}</div>}
              <div className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">category</span>{perk.category}</div>
              {perk.discountPercent > 0 && <div className="flex items-center gap-1 text-green-600 font-semibold"><span className="material-symbols-outlined text-xs">local_offer</span>{perk.discountPercent}% OFF</div>}
            </div>

            {perk.description && <p className="mt-2 text-sm text-zinc-700 line-clamp-2">{perk.description}</p>}

            {perk.createdBy && <div className="mt-3 pt-3 border-t text-xs text-zinc-500">Created by: {perk.createdBy.name || perk.createdBy.email}</div>}
          </Link>
        ))}

        {!loading && perks.length === 0 && (
          <div className="col-span-full text-center py-12 text-zinc-600">
            <span className="material-symbols-outlined text-5xl text-zinc-400 mb-4">sentiment_dissatisfied</span>
            No perks found.
          </div>
        )}
      </div>
    </div>
  )

}


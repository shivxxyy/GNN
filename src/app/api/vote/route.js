import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request) {
  try {
    const { memeId, action } = await request.json()

    if (!memeId || !action) {
      return Response.json({ error: 'Missing memeId or action' }, { status: 400 })
    }

    // Fetch existing vote record
    let { data: existing, error } = await supabase
      .from('meme_votes')
      .select('*')
      .eq('meme_id', memeId)
      .single()

    let updatedVotes = {
      upvotes: 0,
      downvotes: 0,
      total_votes: 0
    }

    if (!existing) {
      // Create new vote record
      if (action === 'upvote') updatedVotes.upvotes = 1
      if (action === 'downvote') updatedVotes.downvotes = 1
      updatedVotes.total_votes = 1

      const { error: insertError } = await supabase
        .from('meme_votes')
        .insert([{ meme_id: memeId, ...updatedVotes }])

      if (insertError) throw insertError
    } else {
      // Update existing record
      updatedVotes = {
        ...existing,
        upvotes: existing.upvotes + (action === 'upvote' ? 1 : 0),
        downvotes: existing.downvotes + (action === 'downvote' ? 1 : 0),
        total_votes: existing.total_votes + 1
      }

      const { error: updateError } = await supabase
        .from('meme_votes')
        .update(updatedVotes)
        .eq('meme_id', memeId)

      if (updateError) throw updateError
    }

    return Response.json({ success: true, votes: updatedVotes })
  } catch (error) {
    console.error('Error processing vote:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const memeId = searchParams.get('memeId')

    if (memeId) {
      const { data, error } = await supabase
        .from('meme_votes')
        .select('*')
        .eq('meme_id', memeId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      const votes = data || { upvotes: 0, downvotes: 0, total_votes: 0 }
      return Response.json({ votes })
    } else {
      const { data, error } = await supabase
        .from('meme_votes')
        .select('*')

      if (error) throw error

      const allVotes = data.reduce((acc, curr) => {
        acc[curr.meme_id] = {
          upvotes: curr.upvotes,
          downvotes: curr.downvotes,
          totalVotes: curr.total_votes
        }
        return acc
      }, {})

      return Response.json({ allVotes })
    }
  } catch (error) {
    console.error('Error fetching votes:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

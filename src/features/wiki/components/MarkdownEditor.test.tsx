import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { MarkdownEditor } from './MarkdownEditor'

function renderEditor(value = '', onChange = vi.fn()) {
  return render(
    <MemoryRouter>
      <MarkdownEditor value={value} onChange={onChange} />
    </MemoryRouter>
  )
}

describe('MarkdownEditor', () => {
  it('renders "Bearbeiten" tab active by default', () => {
    renderEditor()
    expect(screen.getByRole('tab', { name: /bearbeiten/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('shows textarea in Bearbeiten tab', () => {
    renderEditor('hello content')
    expect(screen.getByRole('textbox')).toHaveValue('hello content')
  })

  it('calls onChange when user types', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderEditor('', onChange)

    await user.type(screen.getByRole('textbox'), 'abc')
    expect(onChange).toHaveBeenCalled()
  })

  it('switches to Vorschau tab and shows rendered markdown', async () => {
    const user = userEvent.setup()
    renderEditor('## Hello World')

    await user.click(screen.getByRole('tab', { name: /vorschau/i }))

    expect(screen.getByRole('tab', { name: /vorschau/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('heading', { name: /hello world/i })).toBeInTheDocument()
  })

  it('hides textarea when in Vorschau tab', async () => {
    const user = userEvent.setup()
    renderEditor('some text')

    await user.click(screen.getByRole('tab', { name: /vorschau/i }))

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('shows empty state in Vorschau when no content', async () => {
    const user = userEvent.setup()
    renderEditor('')

    await user.click(screen.getByRole('tab', { name: /vorschau/i }))

    expect(screen.getByText(/noch kein inhalt/i)).toBeInTheDocument()
  })
})

import React from 'react';
import {
  Undo2, Redo2, Printer, Languages, SpellCheck,
  ChevronDown, Bold, Italic, Underline, Baseline,
  Highlighter, Link2, Image, Table, AlignLeft,
  AlignCenter, AlignRight, AlignJustify, List,
  ListOrdered, ListTodo, Type, Minus, Quote,
  Code, MoreVertical, Plus, Minus as MinusIcon,
  ChevronsLeft, ChevronsRight, Search, ListIcon
} from 'lucide-react';

const ToolbarButton = ({ onClick, isActive, disabled, children, tooltip }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-1.5 rounded-lg hover:bg-bg-card-hover transition-colors flex items-center justify-center border-0 bg-transparent cursor-pointer ${isActive ? 'bg-bg-card-hover text-brand-primary' : 'text-text-muted hover:text-text-heading'
      } ${disabled ? 'opacity-20 cursor-not-allowed' : ''}`}
    title={tooltip}
  >
    {children}
  </button>
);

const VerticalDivider = () => <div className="h-5 w-px bg-border-subtle mx-1.5" />;

const Toolbar = ({ editor }) => {
  const [isStyleMenuOpen, setIsStyleMenuOpen] = React.useState(false);
  const [isFontMenuOpen, setIsFontMenuOpen] = React.useState(false);

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result;
          if (dataUrl) editor.chain().focus().setImage({ src: dataUrl }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  const handleFontSizeChange = (delta) => {
    const currentSize = editor.getAttributes('textStyle').fontSize || '16px';
    const size = parseInt(currentSize);
    if (!isNaN(size)) {
      const newSize = Math.max(1, size + delta);
      editor.chain().focus().setFontSize(`${newSize}px`).run();
    }
  };

  return (
    <div className="flex items-center flex-wrap gap-0.5 px-3 py-1.5 bg-bg-sidebar border border-border-subtle shadow-2xl sticky top-2 z-50 no-print min-h-[44px] rounded-xl mx-4 my-3 backdrop-blur-xl">
      {/* History */}
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} tooltip="Undo (Ctrl+Z)">
        <Undo2 size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} tooltip="Redo (Ctrl+Y)">
        <Redo2 size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => window.print()} tooltip="Print (Ctrl+P)">
        <Printer size={16} />
      </ToolbarButton>

      <VerticalDivider />

      {/* Styles */}
      <div className="relative">
        <div
          onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 hover:bg-bg-card-hover rounded-lg cursor-pointer text-xs font-bold transition-all min-w-[110px] ${isStyleMenuOpen ? 'bg-bg-card-hover text-brand-primary' : 'text-text-muted hover:text-text-heading'}`}
        >
          <span className="truncate max-w-[80px]">
            {editor.isActive('heading', { level: 1 }) ? 'Heading 1' :
              editor.isActive('heading', { level: 2 }) ? 'Heading 2' :
                editor.isActive('heading', { level: 3 }) ? 'Heading 3' : 'Normal text'}
          </span>
          <ChevronDown size={12} className={`ml-auto shrink-0 transition-transform ${isStyleMenuOpen ? 'rotate-180' : ''}`} />
        </div>

        {isStyleMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsStyleMenuOpen(false)} />
            <div className="absolute top-full left-0 mt-2 w-48 bg-bg-surface border border-border-subtle shadow-2xl rounded-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => {
                  editor.chain().focus().clearNodes().unsetAllMarks().run();
                  setIsStyleMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-bg-card-hover text-xs font-medium text-text-body border-0 bg-transparent cursor-pointer flex items-center justify-between"
              >
                <span>Normal text</span>
                {!editor.isActive('heading') && <div className="w-1.5 h-1.5 bg-brand-primary rounded-full" />}
              </button>
              <div className="h-px bg-border-subtle my-1 mx-2" />
              {[1, 2, 3].map(level => (
                <button
                  key={level}
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level }).run();
                    setIsStyleMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 hover:bg-bg-card-hover text-text-heading border-0 bg-transparent cursor-pointer flex items-center justify-between ${level === 1 ? 'text-lg font-bold' : level === 2 ? 'text-base font-bold' : 'text-sm font-bold'
                    }`}
                >
                  <span>Heading {level}</span>
                  {editor.isActive('heading', { level }) && <div className="w-1.5 h-1.5 bg-brand-primary rounded-full" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <VerticalDivider />

      {/* Fonts */}
      <div className="relative">
        <div
          onClick={() => setIsFontMenuOpen(!isFontMenuOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 hover:bg-bg-card-hover rounded-lg cursor-pointer text-xs font-bold transition-all min-w-[120px] ${isFontMenuOpen ? 'bg-bg-card-hover text-brand-primary' : 'text-text-muted hover:text-text-heading'}`}
        >
          <span className="truncate max-w-[90px]">
            {editor.getAttributes('textStyle').fontFamily || 'Inter'}
          </span>
          <ChevronDown size={12} className={`ml-auto shrink-0 transition-transform ${isFontMenuOpen ? 'rotate-180' : ''}`} />
        </div>

        {isFontMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsFontMenuOpen(false)} />
            <div className="absolute top-full left-0 mt-2 w-48 bg-bg-surface border border-border-subtle shadow-2xl rounded-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[300px] overflow-y-auto custom-scrollbar">
              {[
                { label: 'Default (Inter)', value: 'Inter' },
                { label: 'Arial', value: 'Arial' },
                { label: 'Courier New', value: 'Courier New' },
                { label: 'Georgia', value: 'Georgia' },
                { label: 'Times New Roman', value: 'Times New Roman' },
                { label: 'Verdana', value: 'Verdana' },
                { label: 'Roboto', value: 'Roboto' },
                { label: 'Montserrat', value: 'Montserrat' },
                { label: 'Playfair Display', value: 'Playfair Display' },
              ].map((font) => (
                <button
                  key={font.value}
                  onClick={() => {
                    editor.chain().focus().setFontFamily(font.value).run();
                    setIsFontMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-bg-card-hover text-xs font-medium text-text-body border-0 bg-transparent cursor-pointer flex items-center justify-between"
                  style={{ fontFamily: font.value }}
                >
                  <span>{font.label}</span>
                  {editor.getAttributes('textStyle').fontFamily === font.value && <div className="w-1.5 h-1.5 bg-brand-primary rounded-full" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <VerticalDivider />

      {/* Font Size Controls */}
      <div className="flex items-center space-x-1">
        <ToolbarButton
          onClick={() => handleFontSizeChange(-1)}
          tooltip="Decrease font size"
        >
          <MinusIcon size={14} />
        </ToolbarButton>
        <div className="px-2 py-0.5 border border-border-subtle rounded-md mx-1 text-xs font-bold bg-bg-canvas text-text-heading min-w-[32px] text-center">
          {parseInt(editor.getAttributes('textStyle').fontSize || '16px')}
        </div>
        <ToolbarButton
          onClick={() => handleFontSizeChange(1)}
          tooltip="Increase font size"
        >
          <Plus size={14} />
        </ToolbarButton>
      </div>

      <VerticalDivider />

      {/* Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        tooltip="Bold (Ctrl+B)"
      >
        <Bold size={16} strokeWidth={editor.isActive('bold') ? 3 : 2} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        tooltip="Italic (Ctrl+I)"
      >
        <Italic size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        tooltip="Underline (Ctrl+U)"
      >
        <Underline size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => {
          const color = window.prompt('Enter hex color (e.g. #ff0000)');
          if (color) editor.chain().focus().setColor(color).run();
        }}
        tooltip="Text color"
      >
        <Baseline size={16} style={{ borderBottom: `3px solid ${editor.getAttributes('textStyle').color || 'var(--color-text-body)'}` }} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive('highlight')}
        tooltip="Highlight color"
      >
        <Highlighter size={16} />
      </ToolbarButton>

      <VerticalDivider />

      {/* Insert and Links */}
      <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} tooltip="Insert link (Ctrl+K)">
        <Link2 size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={addImage} tooltip="Insert image">
        <Image size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} tooltip="Insert table">
        <Table size={16} />
      </ToolbarButton>

      <VerticalDivider />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        tooltip="Align left (Ctrl+Shift+L)"
      >
        <AlignLeft size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        tooltip="Align center (Ctrl+Shift+E)"
      >
        <AlignCenter size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        tooltip="Align right (Ctrl+Shift+R)"
      >
        <AlignRight size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        isActive={editor.isActive({ textAlign: 'justify' })}
        tooltip="Justify (Ctrl+Shift+J)"
      >
        <AlignJustify size={16} />
      </ToolbarButton>

      <VerticalDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        tooltip="Bulleted list (Ctrl+Shift+8)"
      >
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        tooltip="Numbered list (Ctrl+Shift+7)"
      >
        <ListOrdered size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        isActive={editor.isActive('taskList')}
        tooltip="Checklist"
      >
        <ListTodo size={16} />
      </ToolbarButton>

      <VerticalDivider />

      {/* Indentation */}
      <ToolbarButton onClick={() => editor.chain().focus().sinkListItem('listItem').run()} tooltip="Increase indent">
        <ChevronsRight size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().liftListItem('listItem').run()} tooltip="Decrease indent">
        <ChevronsLeft size={16} />
      </ToolbarButton>

      <VerticalDivider />

      <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} tooltip="Clear formatting">
        <Type size={16} className="text-red-400" />
      </ToolbarButton>
    </div>
  );
};

export default Toolbar;

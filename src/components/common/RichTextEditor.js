import React from 'react';
import './RichTextEditor.css';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $createParagraphNode,
} from 'lexical';
import { $createHeadingNode, $createQuoteNode, HeadingNode, QuoteNode } from '@lexical/rich-text';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  ListNode,
  ListItemNode,
} from '@lexical/list';
import { $wrapNodes } from '@lexical/selection';
import { mergeRegister } from '@lexical/utils';
import { 
  Box, 
  IconButton, 
  Divider, 
  Paper,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Title,
  Looks3,
  Looks4,
} from '@mui/icons-material';

const theme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'editor-placeholder',
  paragraph: 'editor-paragraph',
  quote: 'editor-quote',
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
    h4: 'editor-heading-h4',
    h5: 'editor-heading-h5',
  },
  list: {
    nested: {
      listitem: 'editor-nested-listitem',
    },
    ol: 'editor-list-ol',
    ul: 'editor-list-ul',
    listitem: 'editor-listitem',
  },
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    underline: 'editor-text-underline',
    strikethrough: 'editor-text-strikethrough',
    underlineStrikethrough: 'editor-text-underlineStrikethrough',
    code: 'editor-text-code',
  },
};



// Lexical React plugins are React components, which makes them
// highly composable. Furthermore, you can lazy load plugins if
// desired, so you don't pay the cost for plugins until you
// actually use them.
function MyCustomAutoFocusPlugin() {
  return <AutoFocusPlugin />;
}

const LowPriority = 1;

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = React.useState(false);
  const [isItalic, setIsItalic] = React.useState(false);
  const [isUnderline, setIsUnderline] = React.useState(false);

  const updateToolbar = React.useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
    }
  }, []);

  React.useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          updateToolbar();
          return false;
        },
        LowPriority,
      ),
    );
  }, [editor, updateToolbar]);

  const formatText = (format) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createParagraphNode());
      }
    });
  };

  const formatHeading = (headingSize) => {
    if (headingSize === 'paragraph') {
      formatParagraph();
    } else {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const formatNumberedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createQuoteNode());
      }
    });
  };

  return (
    <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
      <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        <IconButton
          size="small"
          onClick={() => formatText('bold')}
          sx={{ color: isBold ? 'primary.main' : 'text.secondary' }}
        >
          <FormatBold />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => formatText('italic')}
          sx={{ color: isItalic ? 'primary.main' : 'text.secondary' }}
        >
          <FormatItalic />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => formatText('underline')}
          sx={{ color: isUnderline ? 'primary.main' : 'text.secondary' }}
        >
          <FormatUnderlined />
        </IconButton>
        
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        
        <IconButton size="small" onClick={() => formatHeading('h2')}>
          <Title />
        </IconButton>
        <IconButton size="small" onClick={() => formatHeading('h3')}>
          <Looks3 />
        </IconButton>
        <IconButton size="small" onClick={() => formatHeading('h4')}>
          <Looks4 />
        </IconButton>
        
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        
        <IconButton size="small" onClick={formatBulletList}>
          <FormatListBulleted />
        </IconButton>
        <IconButton size="small" onClick={formatNumberedList}>
          <FormatListNumbered />
        </IconButton>
        <IconButton size="small" onClick={formatQuote}>
          <FormatQuote />
        </IconButton>
      </Box>
    </Paper>
  );
}

function ContentChangePlugin({ onChange }) {
  const [editor] = useLexicalComposerContext();
  
  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const htmlString = root.getTextContent();
        onChange(htmlString);
      });
    });
  }, [editor, onChange]);
  
  return null;
}

function RichTextEditor({ value, onChange, placeholder = "Start writing your article...", error = false, ...props }) {
  const initialConfig = {
    namespace: 'WildlifeEditor',
    theme,
    onError: (error) => {
      console.error(error);
    },
    nodes: [ListNode, ListItemNode, HeadingNode, QuoteNode],
  };

  const handleContentChange = React.useCallback((content) => {
    if (onChange) {
      onChange(content);
    }
  }, [onChange]);

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        borderColor: error ? 'error.main' : 'grey.300',
        '&:hover': {
          borderColor: error ? 'error.main' : 'primary.main',
        },
        '&:focus-within': {
          borderColor: 'primary.main',
          boxShadow: `0 0 0 1px ${error ? 'red' : 'rgba(25, 118, 210, 0.25)'}`,
        },
      }}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <Box sx={{ position: 'relative', minHeight: 300 }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                style={{
                  minHeight: '300px',
                  padding: '16px',
                  outline: 'none',
                  fontSize: '16px',
                  lineHeight: '1.5',
                  fontFamily: 'inherit',
                }} 
              />
            }
            placeholder={
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  color: 'text.secondary',
                  pointerEvents: 'none',
                  fontSize: '16px',
                }}
              >
                {placeholder}
              </Box>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <MyCustomAutoFocusPlugin />
          <ListPlugin />
          <LinkPlugin />
          <ContentChangePlugin onChange={handleContentChange} />
        </Box>
      </LexicalComposer>
      

    </Paper>
  );
}

export default RichTextEditor; 
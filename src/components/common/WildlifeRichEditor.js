import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Box, Typography, Paper } from '@mui/material';

const WildlifeRichEditor = ({ value, onChange, placeholder, error, helperText, ...props }) => {
  const editorRef = useRef(null);

  const handleEditorChange = (content) => {
    if (onChange) {
      onChange(content);
    }
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
        Article Content *
      </Typography>
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
          overflow: 'hidden',
        }}
      >
        <Editor
          tinymceScriptSrc={process.env.PUBLIC_URL + '/tinymce/tinymce.min.js'}
          onInit={(evt, editor) => editorRef.current = editor}
          value={value || ''}
          init={{
            height: 400,
            menubar: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
              'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'table', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic underline strikethrough | ' +
              'alignleft aligncenter alignright alignjustify | ' +
              'bullist numlist outdent indent | removeformat | ' +
              'link image | table | code fullscreen | help',
            content_style: `
              body { 
                font-family: 'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif; 
                font-size: 16px; 
                line-height: 1.6;
                color: #212121;
                margin: 16px;
              }
              h1, h2, h3, h4, h5, h6 { 
                color: #212121; 
                font-weight: 600;
                margin: 16px 0 8px 0;
              }
              p { margin: 0 0 8px 0; }
              blockquote { 
                border-left: 4px solid #2e7d32; 
                padding-left: 16px; 
                margin: 16px 0;
                font-style: italic;
                background-color: #f5f5f5;
                padding: 16px;
              }
              code { 
                background-color: #f5f5f5; 
                padding: 2px 4px; 
                border-radius: 4px;
                font-family: 'Courier New', monospace;
              }
              table { 
                border-collapse: collapse; 
                width: 100%; 
                margin: 16px 0;
              }
              table td, table th { 
                border: 1px solid #ddd; 
                padding: 8px; 
              }
              table th { 
                background-color: #f5f5f5; 
                font-weight: 600;
              }
            `,
            placeholder: placeholder || "Start writing your wildlife article...",
            branding: false,
            resize: false,
            elementpath: false,
            statusbar: false,
            skin: 'oxide',
            theme: 'silver',
            block_formats: 'Paragraph=p; Heading 2=h2; Heading 3=h3; Heading 4=h4; Blockquote=blockquote; Code=code',
            font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt',
            image_title: true,
            automatic_uploads: true,
          }}
          onEditorChange={handleEditorChange}
          {...props}
        />
      </Paper>
      {helperText && (
        <Typography 
          variant="caption" 
          color={error ? "error" : "text.secondary"} 
          sx={{ mt: 1, display: 'block' }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default WildlifeRichEditor; 
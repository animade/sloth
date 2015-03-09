require 'dotenv'
Dotenv.load

# Reload the browser automatically whenever files change
configure :development do
  activate :autoprefixer
  activate :livereload
end

set :css_dir, 'stylesheets'
set :js_dir, 'javascripts'
set :images_dir, 'images'

# Build-specific configuration
configure :build do
  # All the bower components get compiled
  # into the home.js file anyway.
  ignore 'bower_components/**/*'

  # For example, change the Compass output style for deployment
  activate :minify_css

  # Minify Javascript on build
  activate :minify_javascript

  # Enable cache buster
  # activate :asset_hash, ignore: "scenes", ignore: "javascripts"

  # Use relative URLs
  activate :relative_assets

  # Autoprefix CSS
  activate :autoprefixer do |config|
    config.browsers = ['last 2 versions', 'Explorer >= 9']
  end

  # Or use a different image path
  # set :http_prefix, "/Content/images/"
end

# Use bower in sprockets - http://fearmediocrity.co.uk/2014/01/25/using_bower_with_middleman/
after_configuration do
  sprockets.append_path File.join root.to_s, "source/bower_components"
end

# Deploy site to github pages
activate :deploy do |deploy|
  deploy.build_before = true
  deploy.method = :git
end
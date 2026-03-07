#!/usr/bin/env python3
import os
import json
from datetime import datetime

def scan_directory(root_dir, current_dir, categories=None):
    if categories is None:
        categories = []
    
    full_path = os.path.join(root_dir, *categories, current_dir) if categories else os.path.join(root_dir, current_dir)
    
    node = {
        'name': current_dir,
        'type': 'category',
        'children': [],
        'posts': []
    }
    
    for item in os.listdir(full_path):
        item_path = os.path.join(full_path, item)
        if os.path.isdir(item_path):
            md_filename = f"{item}.md"
            md_file = os.path.join(item_path, md_filename)
            
            if os.path.exists(md_file):
                mtime = os.path.getmtime(item_path)
                date_str = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
                
                rel_path_parts = categories + [current_dir, item] if categories else [current_dir, item]
                rel_path = '/'.join(rel_path_parts)
                
                post = {
                    "id": '_'.join(rel_path_parts),
                    "title": item,
                    "date": date_str,
                    "path": f"/blog/archive/{rel_path}/",
                    "categories": categories + [current_dir] if categories else [current_dir]
                }
                node['posts'].append(post)
            else:
                new_categories = categories + [current_dir] if categories else [current_dir]
                child_node = scan_directory(root_dir, item, new_categories)
                node['children'].append(child_node)
    
    node['posts'].sort(key=lambda x: x["date"], reverse=True)
    node['children'].sort(key=lambda x: x["name"])
    
    return node

def build_tree_from_posts(posts):
    tree = {
        'name': 'root',
        'type': 'category',
        'children': [],
        'posts': []
    }
    
    category_map = {}
    
    for post in posts:
        current = tree
        path = ['root']
        
        for i, cat in enumerate(post['categories']):
            path.append(cat)
            path_key = '/'.join(path)
            
            if path_key not in category_map:
                new_node = {
                    'name': cat,
                    'type': 'category',
                    'children': [],
                    'posts': []
                }
                category_map[path_key] = new_node
                current['children'].append(new_node)
            
            current = category_map[path_key]
        
        current['posts'].append(post)
    
    for node in category_map.values():
        node['posts'].sort(key=lambda x: x["date"], reverse=True)
        node['children'].sort(key=lambda x: x["name"])
    
    tree['children'].sort(key=lambda x: x["name"])
    
    return tree

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    archive_dir = os.path.join(script_dir, 'archive')
    config_path = os.path.join(script_dir, 'config.json')

    site_config = {
        "title": "如珩的博客",
        "subtitle": "技术笔记与分享",
        "author": "如珩"
    }

    posts = []

    if os.path.exists(archive_dir):
        for item in os.listdir(archive_dir):
            item_path = os.path.join(archive_dir, item)
            if os.path.isdir(item_path):
                md_filename = f"{item}.md"
                md_file = os.path.join(item_path, md_filename)
                
                if os.path.exists(md_file):
                    mtime = os.path.getmtime(item_path)
                    date_str = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
                    
                    post = {
                        "id": item,
                        "title": item,
                        "date": date_str,
                        "path": f"/blog/archive/{item}/",
                        "categories": []
                    }
                    posts.append(post)
                else:
                    def find_posts_recursive(root_dir, current_dir, categories=None):
                        if categories is None:
                            categories = []
                        
                        found_posts = []
                        full_path = os.path.join(root_dir, *categories, current_dir) if categories else os.path.join(root_dir, current_dir)
                        
                        for item in os.listdir(full_path):
                            item_path = os.path.join(full_path, item)
                            if os.path.isdir(item_path):
                                md_filename = f"{item}.md"
                                md_file = os.path.join(item_path, md_filename)
                                
                                if os.path.exists(md_file):
                                    mtime = os.path.getmtime(item_path)
                                    date_str = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
                                    
                                    rel_path_parts = categories + [current_dir, item] if categories else [current_dir, item]
                                    rel_path = '/'.join(rel_path_parts)
                                    
                                    post = {
                                        "id": '_'.join(rel_path_parts),
                                        "title": item,
                                        "date": date_str,
                                        "path": f"/blog/archive/{rel_path}/",
                                        "categories": categories + [current_dir] if categories else [current_dir]
                                    }
                                    found_posts.append(post)
                                else:
                                    new_categories = categories + [current_dir] if categories else [current_dir]
                                    found_posts.extend(find_posts_recursive(root_dir, item, new_categories))
                        
                        return found_posts
                    
                    posts.extend(find_posts_recursive(archive_dir, item))

    posts.sort(key=lambda x: x["date"], reverse=True)
    category_tree = build_tree_from_posts(posts)

    config = {
        "site": site_config,
        "posts": posts,
        "categoryTree": category_tree
    }

    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, ensure_ascii=False, indent=2)

    print(f"成功更新 config.json，共发现 {len(posts)} 篇文章")

if __name__ == "__main__":
    main()

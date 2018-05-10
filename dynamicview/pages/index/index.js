Page({
  data: {
    nodes: [{
      tag: 'view',
      children: [
        {
          tag: 'view',
          children: [
            {
              tag: 'text',
              value: 'click me',
              style: 'color: red; font-size: 50rpx',
              data: {
                i: 1,
                s: 'event data'
              }
            },
            {
              tag: 'image',
              style: 'width: 50rpx; height: 50rpx',
              src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAMAAAAL34HQAAAC91BMVEUAAAB/R/2PSP9uRvuQSP+TSP9pRvqVSP9oRvppRvpsRvtuRvtyRvuVSP+TSP+PSP+RSP+QSP+PR/9xRvt/R/1wRvttRvtoRvpvRvtuRvuPSP+BR/2MSP6TSP+SSP+VSP+FR/5qRvuSSP+JR/6RSP9pRvqDR/2VSP99R/1yRvtoRvpwRvt8R/yMR/52R/x/R/2KR/52R/yER/2RSP98R/yQSP+VSP+ER/1oRvp/R/1yRvuVSP94R/xpRvqIR/6RSP+RSP9wRvuHR/6RSP+MR/5yRvtvRvtuRvuKSf5tRvtrRvtsRvv///////9tRvt+R/yER/2AR/2FR/1pRvp9R/xoRvqOSP58R/x4R/yVSP+VSP////////9/R/1/R/3///////+DX/yaf/z////f1v7///9vRvtvRvuLSP7///9sRvuPSP50R/uNSP52R/xqRvpxRvt5R/yJR/58R/yUSP9+R/yRSP+TSP+CR/2HR/14R/xpRvqSSP9/R/1zRvt7R/yFR/2BR/2ER/2IR/77+vy+nP2GRvr8+/5/Rvr+/v/29Pr6+P2FR/v9/f6DRvv59/uBRvz08fmCRfh7RfV+RPL49ft4Qux9R/t8Rvl8Rfh3Rfb18vrx7vbu6fR3QeZ+R/t5Rvl5Q+92Qel0Qed7Q/F9Q+55Rffw7Pbo4/F7Qux5Qen59/x3Rvl/Rfjz8fd3RPGBRfV5RPPm3+9xQen09PZ9RfXs6fJ1Q+9yQeXq5vLj3+3i3OxzQuxvQeV1QOR+RfZ2RfPr5/J1Q+3g2etzQepyP+T49f/7+v7n4fDp6OzZ1tuegPzv7fGeevHe1+n18v/Cr/22nv3y7vja0+fj4eVwP+Pj1/7m3P3Svv28p/2Oavu1mPXy8fSHX+ns5v/e0v7NvP7h1f2qgP2baPzXyfuVcvmgg+yOY+zm5eh9Tubf3eHc2t7v6P/x6v6miv3NufuMYfiDVfiCUOqnj+Otk/2xiPx4UvuOVfrGsPWUb+zw6/qCSfWWeeCmHaEcAAAAZ3RSTlMACx4hI/f37e3E5x34xYtvXDgpJwOCdWFfOBkH9/Pp3MWdm5eEhINhYcOXivDu7Ojj3tvLxb6ysrKfmJaTjo1+d21iUUBALBj79vHLh29T8/Dw69va2cazsZ+ASAfz8uzr5Mmel2lcLz9qYgAACPNJREFUeNrM00uqgzAUBuBjSMgoPoqjWhVEcFS4IDpxUMGuodCu4EJwFurExd+7gMZXXv1W8HP+/4AidK9ez5bllKZCpJTmrH2+qjsCZ05Vx6iQoKyrTmAbDloqVtE2wGBN5Odis9yPwIKTPJM8meE6vYqJQ1jlgSnnkorDaHkGE1BBhBJSIP2X6ohQRjq9wbySCC1IqXFjYSa0yULQAzeTVg0GdXFPJs1IH4MizCYDGFZcVToZkaosLCkmY4oEDkL1bFCN4JAom43KIjhgILNhZIDdgtmCAHa6va24wS7+2xL/K1P95/q6Bnf2GHCrNu5+4JYNsEGUcsvSCFahjFuXIViR1NyBOoFlBXeigEUhdySEBeg6OnLFIBU/RmceMcj0o0M9SODL6NBFVmMzOtVIvnB0LIQPvJ9fx/6Yq5+QNMM4gONPsXvUMToIhXSJwot06SAdOlb37eyugmAHwUz3mr7+Sd+ESF9QX9H3HUoTlKmgiBjCWGODiRCMpYcYFG2DaLDLnuc1LeyPvycZvd+DXj/8fr9HF0bQ3Wb0z97MXdXklP7Zm5pE/U3rFdB0v2p0Ra+AVkaVOCw8LuVd1j3XpdYrJPVt1cicQSHNjaCbdAbFpEM3qQyKSYV6TRgU1ESPtbQFbePpbQFb6rEW6Ej/17bQVY1vgGLZN8PFshuQxrs7BJnYS/uQXbIsRNbdogbGarteD5WrDRuYBsm9AG7Q39oeRrXdYv0w1wtEGrMMjmU9fv+BfRiWneUO/H6WtQxsDJG0QNYBxzWfrmqyHJSlRaR1AMvqIax4vEGJsdm8Xq/NxrgbK/E4YXmsloGtE9WEBcKyyizx9znFMe2mQ6H0vpOwzq9EibA8EJZlArN0FkiY5ec4UTp1QVHpZD7XVR22RUmEs3SYNW2F5OlsUeI/wp6js57J58LXKqYl8pLIZVOEBWgas1RwVjYuSvwxAOWuFDPJSji0g1WYZY+X+M6wYCwVZq1aacYl8qXm4EMvFAs9FcM0OVlVxioYaxWhURM4RypL1sg3Bi2wWi3W8z1V42+Jl+J4hQ6HCdgoWqZgERde44DnGDo6KmbyvQ2eXWGVKIBVpGU0a4Lm8xGXgF2nh4+ockSV7KkO2z2Vz2cCNovUJipXOSsEo488R3fyqHpbxbR4XgoK2TJYRVKjRROVK1XmsKt0/OCxY1VdVu26sMptl/hoUODKKaICt4i0mxTJLiESjNUuHjh2skByV/uyivkeLEWDEUFWbcLTIhX5onJlhYgU40/uUSWq1cL179XuW7LCk3iNWkVSIc0mTfJ5BfAaYz/O+lHeOr4qvMDEFzwrWfXtVy2GVfjcKVkaNG+mymh0OPYCEXxefc/RW6kWC/Vk5VpFVvjpZy0WjQiBPYfDaDTTNI/WzPSuMnbFSreeoy2dlCeVDydCO10V8wGrgtQq0hp6ZaZ37QXekbM/xv/Ezv10KJzM4DCqMypnR+X+/PU9PixqFeklwh9Pdv1JhMO5XK6Sx1Uq4Q5KVjGM+6ImqwLUKtI/VuvnJe04juP4O7pNbyHUPxBGYgReEi8dqmOXoP4FYchEvHjIiyAaIhKiczGlwF2+KKIsGTVCYrE10dqaZJkN1JmDVqvDGjvs8/58vq1f28HPe49TpxdPPp/PlwRn9+Jx1oXP/nWD/dBbeqFa2g2xL5BF8ar68zx77hl2WPG4s2sw7ewSZkWji5l0YTN/UgmFQqlUajeVYn88wyi16uh7fmUZq6IyVdNgcHYNu/AaWVftp589L8GvHtWWNxAofcGPMC1ThQww4pSAXfx55Yv+sJ8LqyeFRxXwFvfYR8irpLJGYMYhIxJhXenV5ZW9g2AwHA6Gg6wJTwqPyuc72MtvFrAqGonIzM+AySFFdBVY14+Fax68P6z6JqqSUlXIBLMOKdiV5M8+32D/Z1gSRvGj8tXz69m1dCb5FKukzMKYQwpmYddadv2kgk1ehkdZKyesalW6Co3BoEMSXmMys8q6aiXeJKKsb2q8alG2Cg2C3i0vkYhtYNdVKYBRouoKqzZiyQRhWA8TboJEUnTVPvtElPUTO6tNUhWaAI2bALvYs8+u/2rnvFafJ9e+YFWFNFZRaAAMdgretZa9eKe6UKtIowYAMJEWEuIeW53OV6bTaYl3RcsyAYDFTqIoMdbVan/k2i1WFVMU2qYFAPR2mgR2Fd+qiliVIE7qAaDPTpRgB9Z8Lxw2YwpW0fQBY3RRKUo1lztkcrmqopDnjIDmXHRnQdWZi24O0LiL7tyjOnfRjQPqtdG5A14u4LbR9QI3aqPb8nFbNrpRECw2upKVK9noLCAM2OiORNaRjW4A4L/dYkVkVehLo3Bt+DFZXWTV6UvDcG2SPtYQWQ360iT8MUQeOxZZx+ShIbjRT14ri6wyeagfbvQYqWv7ImufumPsgVt01LkdkbVD3dHBbVPaeZpLD3dJnNFOwR1m4t5pjjslzpjhrl7icW2/5LZpK9peuMf8hKT5imvSVsxwn0ZLGqx+4KqkEa0GHtBJ7MyXF6x/tVCel5jTwUM9j7rf2bb+0+9m7V03YRgK4/gXWYrihC2Qi5gyZABegIWBARDXBTGB1HutRJWSve9Hhy4w0ql9gY7MpUulSknASezwe4K/dI68+LzH3HQFCZyY2z5IdYi5OUjUihPIy2ohmVljnLKGyDjVTKSwGKd4tw0SbXcx42QhTb3FKnNXRyoyYRU5PiLDM6vI5wxZPFaJ7yA7qzllFfh4C+bIZOhMuuPp33uNbO6YSfbyFQQ3G5yxYJL9njg94SwrlOpwqnrABRqhRPsguJ3jIp1QmvvZfL0Brqyrgz9XNMcG/rmSvbfAbTEOBRsvkIOrh0LpLnIxppFAUwM5Nb1IGK+J/JxJJMTEQSGERgJQgoLqlhqVTLXqKM6kUamoiXI4elQa3UZpFF8taX6+gjIZbfW1MLVtoGykaJjqEYgw8rX8UZo/giiKTfNFUVuBUMOeztuk94aQwO0tL29a9lxIQ/pd7YJ96vYJZDPtNtVSi2jbNlEZMrB9r0tXmqaengBNW9Gu59sDgmJ+ABxNsdObRdJSAAAAAElFTkSuQmCC'
            }
          ]
        },
        {
          tag: 'text',
          value: 'hello',
          style: 'font-weight: bold'
        }, 
        {
          tag: 'text',
          value: ' '
        },
        {
          tag: 'text',
          value: 'world'
        }
      ]
    }]
  }
})
